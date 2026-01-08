import { Booking, BookingStatus } from "./booking.entity";
import { PricingCalculatorService } from "../event/services/pricing-calculater.service";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../../common/errors/app.error";
import logger from "../../utils/logger";
import { TicketRepository } from "../ticket/ticket.repository";
import { BookingRepository } from "./booking.repository";
import { ILockService } from "../../common/lock.service.interface";

export class BookingService {
  private static LOCK_TTL = 600;

  constructor(
    private readonly ticketRepo: typeof TicketRepository,
    private readonly bookingRepo: typeof BookingRepository,
    private readonly lockService: ILockService,
    private readonly pricingCalculator: PricingCalculatorService
  ) {}

  async createBooking(data: {
    sessionId: string;
    seatId: string;
    userId: string;
    priceId: string;
    userAge?: number;
  }): Promise<Booking> {
    const lockKey = `lock:session:${data.sessionId}:seat:${data.seatId}`;
    let lockAcquired = false;

    try {
      // Lock
      lockAcquired = await this.lockService.acquireLock(
        lockKey,
        BookingService.LOCK_TTL
      );

      if (!lockAcquired) {
        throw new BadRequestError("Bu koltuk şu an işlem görüyor.");
      }

      // Ticket Check
      const soldTicket = await this.ticketRepo.findSoldTicket(
        data.sessionId,
        data.seatId
      );
      if (soldTicket) {
        throw new ConflictError("Bu koltuk satılmış.");
      }

      // Booking Check
      const activeBooking = await this.bookingRepo.findActiveBooking(
        data.sessionId,
        data.seatId
      );
      if (activeBooking) {
        throw new ConflictError("Aktif rezervasyon var.");
      }

      // Price Calculation
      const priceResult = await this.pricingCalculator.calculateFinalPrice(
        data.sessionId,
        data.priceId,
        { userId: data.userId, userAge: data.userAge, ticketQuantity: 1 }
      );

      const booking = this.bookingRepo.create({
        sessionId: data.sessionId,
        seatId: data.seatId,
        userId: data.userId,
        totalAmount: priceResult.finalPrice,
        status: BookingStatus.PENDING,
        expiresAt: new Date(Date.now() + BookingService.LOCK_TTL * 1000),
      });

      const saved = await this.bookingRepo.save(booking);

      logger.info({
        message: "Rezervasyon oluşturuldu",
        bookingId: saved.id,
        sessionId: data.sessionId,
        seatId: data.seatId,
        userId: data.userId,
      });

      return saved;
    } catch (error) {
      if (lockAcquired) {
        await this.lockService.releaseLock(lockKey);
        logger.info({
          message: "Hata nedeniyle lock serbest bırakıldı",
          lockKey,
        });
      }
      throw error;
    }
  }

  async cancelBooking(bookingId: string): Promise<void> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ["session", "seat"],
    });

    if (!booking) {
      throw new NotFoundError("Rezervasyon bulunamadı.");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestError(
        "Sadece beklemedeki rezervasyonlar iptal edilebilir."
      );
    }

    booking.status = BookingStatus.CANCELLED;
    await this.bookingRepo.save(booking);

    const lockKey = `lock:session:${booking.sessionId}:seat:${booking.seatId}`;
    await this.lockService.releaseLock(lockKey);

    logger.info({
      message: "Rezervasyon iptal edildi ve lock serbest bırakıldı",
      bookingId,
      lockKey,
    });
  }

  async confirmBooking(bookingId: string): Promise<void> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ["session", "seat"],
    });

    if (!booking) {
      throw new NotFoundError("Rezervasyon bulunamadı.");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestError(
        "Sadece beklemedeki rezervasyonlar onaylanabilir."
      );
    }

    booking.status = BookingStatus.CONFIRMED;
    await this.bookingRepo.save(booking);

    const lockKey = `lock:session:${booking.sessionId}:seat:${booking.seatId}`;
    await this.lockService.releaseLock(lockKey);

    logger.info({
      message: "Rezervasyon onaylandı ve lock serbest bırakıldı",
      bookingId,
      lockKey,
    });
  }

  async getBookingById(bookingId: string): Promise<Booking | null> {
    return await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ["session", "session.event", "seat"],
    });
  }
}

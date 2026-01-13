import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../common/errors/app.error";
import { ILockService } from "../../common/lock.service.interface";
import { AppRedisClient } from "../../config/redis";
import logger from "../../utils/logger";
import { PricingCalculatorService } from "../event/services/pricing-calculater.service";
import { ITicketRepository } from "../ticket/ticket.repository.interface";
import { Booking, BookingStatus } from "./booking.entity";
import { IBookingRepository } from "./booking.repository.interface";

export class BookingService {
  private static LOCK_TTL = 600;

  constructor(
    private readonly ticketRepo: ITicketRepository,
    private readonly bookingRepo: IBookingRepository,
    private readonly lockService: ILockService,
    private readonly pricingCalculator: PricingCalculatorService,
    private redisClient: AppRedisClient
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
      // 1. Lock
      lockAcquired = await this.lockService.acquireLock(
        lockKey,
        BookingService.LOCK_TTL
      );

      if (!lockAcquired) {
        throw new BadRequestError("Bu koltuk şu an işlem görüyor.");
      }

      // 2. Controller (Ticket & Active Booking)
      const soldTicket = await this.ticketRepo.findSoldTicket(
        data.sessionId,
        data.seatId
      );
      if (soldTicket) {
        throw new ConflictError("Bu koltuk satılmış.");
      }

      const activeBooking = await this.bookingRepo.findActiveBooking(
        data.sessionId,
        data.seatId
      );
      if (activeBooking) {
        throw new ConflictError("Aktif rezervasyon var.");
      }

      // 3. Calculate Price
      const priceResult = await this.pricingCalculator.calculateFinalPrice(
        data.sessionId,
        data.priceId,
        { userId: data.userId, userAge: data.userAge, ticketQuantity: 1 }
      );

      // 4. Save Reservation to DB
      const booking = this.bookingRepo.create({
        sessionId: data.sessionId,
        seatId: data.seatId,
        userId: data.userId,
        totalAmount: priceResult.finalPrice,
        status: BookingStatus.PENDING,
        expiresAt: new Date(Date.now() + BookingService.LOCK_TTL * 1000),
      });

      const saved = await this.bookingRepo.save(booking);

      await this.redisClient.incr(`session:${data.sessionId}:booked_count`);

      logger.info({
        message: "Rezervasyon oluşturuldu ve Sayaç artırıldı",
        bookingId: saved.id,
        sessionId: data.sessionId,
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

    await this.redisClient.decr(`session:${booking.sessionId}:booked_count`);

    logger.info({
      message: "Rezervasyon iptal edildi, lock açıldı, sayaç düşüldü",
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

import { BadRequestError, NotFoundError } from "../../common/errors/app.error";
import { ILockService } from "../../common/lock.service.interface";
import { AppDataSource } from "../../config/db";
import logger from "../../utils/logger";
import { Booking, BookingStatus } from "../booking/booking.entity";
import { IBookingRepository } from "../booking/booking.repository.interface";
import { Ticket, TicketStatus } from "./ticket.entity";
import { ITicketRepository } from "./ticket.repository.interface";

export class TicketService {
  constructor(
    private readonly ticketRepo: ITicketRepository,
    private readonly bookingRepo: IBookingRepository,
    private readonly lockService: ILockService
  ) {}

  private generateReferenceCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private validateBookingStatus(booking: Booking): void {
    if (booking.status === BookingStatus.CONFIRMED) {
      throw new BadRequestError("Bu rezervasyon zaten biletleştirilmiş.");
    }

    if (
      booking.status === BookingStatus.TIMEOUT ||
      booking.status === BookingStatus.CANCELLED
    ) {
      throw new BadRequestError(
        "Bu rezervasyonun süresi dolmuş veya iptal edilmiş."
      );
    }
  }

  private createTicketFromBooking(booking: Booking): Ticket {
    const newTicket = this.ticketRepo.create({
      session: booking.session,
      seat: booking.seat!,
      user: booking.user,
      price: booking.totalAmount,
      booking: booking,
      status: TicketStatus.PAID,
      purchasedAt: new Date(),
      referenceCode: this.generateReferenceCode(),
    });

    return newTicket;
  }

  async issueTicket(bookingId: string): Promise<Ticket> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let lockKey: string | null = null;

    try {
      const booking = await queryRunner.manager.findOne(Booking, {
        where: { id: bookingId },
        relations: ["session", "seat", "user"],
      });

      if (!booking) {
        throw new NotFoundError("Rezervasyon bulunamadı.");
      }

      this.validateBookingStatus(booking);

      lockKey = `lock:session:${booking.sessionId}:seat:${booking.seatId}`;

      const newTicket = this.createTicketFromBooking(booking);
      await queryRunner.manager.save(newTicket);

      booking.status = BookingStatus.CONFIRMED;
      await queryRunner.manager.save(booking);

      await queryRunner.commitTransaction();

      if (lockKey) {
        await this.lockService.releaseLock(lockKey);
        logger.info({
          message: "Bilet kesildi ve lock serbest bırakıldı",
          ticketId: newTicket.id,
          referenceCode: newTicket.referenceCode,
          bookingId,
        });
      }

      return newTicket;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error({ message: "Bilet oluşturma hatası", error, bookingId });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

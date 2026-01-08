import { AppDataSource } from "../../config/db";
import { Ticket, TicketStatus } from "./ticket.entity";
import { Booking, BookingStatus } from "../booking/booking.entity";
import logger from "../../utils/logger";
import { BadRequestError, NotFoundError } from "../../common/errors/app.error";
import { ILockService } from "../../common/lock.service.interface";

export class TicketService {
  constructor(
    private readonly ticketRepo = AppDataSource.getRepository(Ticket),
    private readonly bookingRepo = AppDataSource.getRepository(Booking),
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
    const newTicket = new Ticket();
    newTicket.session = booking.session;
    newTicket.seat = booking.seat!;
    newTicket.user = booking.user;
    newTicket.price = booking.totalAmount;
    newTicket.booking = booking;
    newTicket.status = TicketStatus.PAID;
    newTicket.purchasedAt = new Date();
    newTicket.referenceCode = this.generateReferenceCode();

    return newTicket;
  }

  async issueTicket(bookingId: string): Promise<Ticket> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const booking = await queryRunner.manager.findOne(Booking, {
        where: { id: bookingId },
        relations: ["session", "seat", "user"],
      });

      if (!booking) {
        throw new NotFoundError("Rezervasyon bulunamadı.");
      }

      this.validateBookingStatus(booking);

      const newTicket = this.createTicketFromBooking(booking);
      await queryRunner.manager.save(newTicket);

      booking.status = BookingStatus.CONFIRMED;
      await queryRunner.manager.save(booking);

      await queryRunner.commitTransaction();

      const lockKey = `lock:session:${booking.sessionId}:seat:${booking.seatId}`;
      await this.lockService.releaseLock(lockKey);

      logger.info({
        message: "Bilet kesildi ve lock serbest bırakıldı",
        ticketId: newTicket.id,
        referenceCode: newTicket.referenceCode,
        bookingId,
        lockKey,
      });

      return newTicket;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error({ message: "Bilet oluşturma hatası", error });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

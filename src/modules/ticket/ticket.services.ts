import { AppDataSource } from "../../config/db";
import { Ticket, TicketStatus } from "./ticket.entity";
import { Booking, BookingStatus } from "../booking/booking.entity";
import logger from "../../utils/logger";
import { BadRequestError, NotFoundError } from "../../common/errors/app.error";

export class TicketService {
  private ticketRepo = AppDataSource.getRepository(Ticket);
  private bookingRepo = AppDataSource.getRepository(Booking);

  private generateReferenceCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
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

      const newTicket = new Ticket();
      newTicket.session = booking.session;
      newTicket.seat = booking.seat!;
      newTicket.user = booking.user;
      newTicket.price = booking.totalAmount;
      newTicket.booking = booking;
      newTicket.status = TicketStatus.PAID;
      newTicket.purchasedAt = new Date();
      newTicket.referenceCode = this.generateReferenceCode();

      await queryRunner.manager.save(newTicket);

      booking.status = BookingStatus.CONFIRMED;
      await queryRunner.manager.save(booking);

      await queryRunner.commitTransaction();
      logger.info(`✅ Bilet kesildi: ${newTicket.referenceCode}`);

      return newTicket;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error("Bilet oluşturma hatası:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

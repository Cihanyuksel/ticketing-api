import { AppDataSource } from "../../config/db";
import { Booking, BookingStatus } from "./booking.entity";

export const BookingRepository = AppDataSource.getRepository(Booking).extend({
  async findActiveBooking(
    sessionId: string,
    seatId: string
  ): Promise<Booking | null> {
    return this.createQueryBuilder("booking")
      .where("booking.sessionId = :sessionId", { sessionId })
      .andWhere("booking.seatId = :seatId", { seatId })
      .andWhere("booking.status = :status", { status: BookingStatus.PENDING })
      .andWhere("booking.expiresAt > :now", { now: new Date() })
      .getOne();
  },
});

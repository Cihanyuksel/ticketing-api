import { Booking } from "./booking.entity";

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  findOne(options: any): Promise<Booking | null>;
  find(options?: any): Promise<Booking[]>;
  create(data: Partial<Booking>): Booking;
  save(booking: Booking): Promise<Booking>;
  remove(booking: Booking): Promise<void>;
  findActiveBooking(sessionId: string, seatId: string): Promise<Booking | null>;
}

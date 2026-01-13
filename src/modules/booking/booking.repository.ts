import { Repository } from "typeorm";
import { IBookingRepository } from "./booking.repository.interface";
import { Booking, BookingStatus } from "./booking.entity";
import { AppDataSource } from "../../config/db";

export class BookingRepository implements IBookingRepository {
  private repo: Repository<Booking>;

  constructor() {
    this.repo = AppDataSource.getRepository(Booking);
  }

  async findById(id: string): Promise<Booking | null> {
    return await this.repo.findOneBy({ id });
  }

  async findOne(options: any): Promise<Booking | null> {
    return await this.repo.findOne(options);
  }

  async find(options?: any): Promise<Booking[]> {
    return await this.repo.find(options);
  }

  create(data: Partial<Booking>): Booking {
    return this.repo.create(data);
  }

  async save(booking: Booking): Promise<Booking> {
    return await this.repo.save(booking);
  }

  async remove(booking: Booking): Promise<void> {
    await this.repo.remove(booking);
  }

  async findActiveBooking(
    sessionId: string,
    seatId: string
  ): Promise<Booking | null> {
    return await this.repo
      .createQueryBuilder("booking")
      .where("booking.sessionId = :sessionId", { sessionId })
      .andWhere("booking.seatId = :seatId", { seatId })
      .andWhere("booking.status = :status", { status: BookingStatus.PENDING })
      .andWhere("booking.expiresAt > :now", { now: new Date() })
      .getOne();
  }
}

import { AppDataSource } from "../../config/db";
import redisClient from "../../config/redis";
import { Booking, BookingStatus } from "./booking.entity";
import { PricingCalculatorService } from "../event/services/pricing-calculater.service";
import { BadRequestError } from "../../common/errors/app.error";

export class BookingService {
  private bookingRepo = AppDataSource.getRepository(Booking);
  private pricingCalculator = new PricingCalculatorService();
  private static LOCK_TTL_SECONDS = 600; 

  async createBooking(data: {
    sessionId: string;
    seatId: string;
    userId: string;
    priceId: string;
    userAge?: number;
  }): Promise<Booking> {
    const lockKey = `lock:session:${data.sessionId}:seat:${data.seatId}`;

    const isLocked = await redisClient.set(lockKey, data.userId, {
      EX: BookingService.LOCK_TTL_SECONDS,
      NX: true,
    });

    if (!isLocked) {
      throw new BadRequestError(
        "Bu koltuk şu an başkası tarafından işlem görüyor."
      );
    }

    try {
      const priceResult = await this.pricingCalculator.calculateFinalPrice(
        data.sessionId,
        data.priceId,
        {
          userId: data.userId,
          userAge: data.userAge,
          ticketQuantity: 1,
        }
      );

      const booking = this.bookingRepo.create({
        sessionId: data.sessionId,
        seatId: data.seatId,
        userId: data.userId,
        totalAmount: priceResult.finalPrice,
        status: BookingStatus.PENDING,
        expiresAt: new Date(
          Date.now() + BookingService.LOCK_TTL_SECONDS * 1000
        ),
      });

      return await booking.save();
    } catch (error) {
      await redisClient.del(lockKey);
      throw error;
    }
  }

  async getBookingById(bookingId: string) {
    return await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ["session", "session.event", "seat"],
    });
  }
}

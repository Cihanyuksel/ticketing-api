import { AppDataSource } from "../../config/db";
import redisClient from "../../config/redis";
import { Booking, BookingStatus } from "./booking.entity";
import { PricingCalculatorService } from "../event/services/pricing-calculater.service";
import { BadRequestError, NotFoundError } from "../../common/errors/app.error";
import logger from "../../utils/logger";

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
    await redisClient.del(lockKey);

    logger.info(`🚫 Rezervasyon iptal edildi ve kilit açıldı: ${bookingId}`);
  }

  async getBookingById(bookingId: string) {
    return await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ["session", "session.event", "seat"],
    });
  }
}

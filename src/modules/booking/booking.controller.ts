import { Request, Response } from "express";
import { asyncHandlerWithThis } from "../../common/middleware/async-handler";
import { ApiResponse } from "../../common/responses/api-response";
import { CreateBookingDto } from "./booking.dto";
import { BookingService } from "./booking.service";

export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  createBooking = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const dto: CreateBookingDto = req.body;

      const booking = await this.bookingService.createBooking({
        sessionId: dto.sessionId,
        seatId: dto.seatId,
        priceId: dto.priceId,
        userId: dto.userId,
        userAge: dto.userAge,
      });

      return ApiResponse.created(
        res,
        booking,
        "Koltuk ayrıldı, ödeme bekleniyor."
      );
    }
  );

  getBooking = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { bookingId } = req.params;
      const booking = await this.bookingService.getBookingById(bookingId);
      return ApiResponse.success(res, booking, "Rezervasyon detayı");
    }
  );

  cancelBooking = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { bookingId } = req.params;

      await this.bookingService.cancelBooking(bookingId);

      return ApiResponse.success(
        res,
        null,
        "Rezervasyon başarıyla iptal edildi."
      );
    }
  );
}

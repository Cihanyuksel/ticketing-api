import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import { asyncHandlerWithThis } from "../../common/middleware/async-handler";
import { ApiResponse } from "../../common/responses/api-response";

export class BookingController {
  private bookingService = new BookingService();

  // POST /bookings
  createBooking = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId, seatId, priceId, userId, userAge } = req.body;

      if (!userId) {
        throw new Error("User ID zorunludur!");
      }

      const booking = await this.bookingService.createBooking({
        sessionId,
        seatId,
        priceId,
        userId,
        userAge,
      });

      return ApiResponse.created(
        res,
        booking,
        "Koltuk ayrıldı, ödeme bekleniyor."
      );
    }
  );

  // GET /bookings/:id
  getBooking = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { bookingId } = req.params;
      const booking = await this.bookingService.getBookingById(bookingId);
      return ApiResponse.success(res, booking, "Rezervasyon detayı");
    }
  );
}

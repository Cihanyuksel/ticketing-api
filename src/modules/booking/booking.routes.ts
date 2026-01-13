import { Router } from "express";
import { BookingModule } from "./booking.module";
import {
  CreateBookingDto,
  CancelBookingDto,
  GetBookingDto,
} from "./booking.dto";
import { validateRequest } from "../../common/middleware/validate-request";

const router = Router();

const bookingController = BookingModule.getController();

router.post(
  "/",
  validateRequest(CreateBookingDto),
  bookingController.createBooking
);

router.get(
  "/:bookingId",
  validateRequest(GetBookingDto),
  bookingController.getBooking
);

router.patch(
  "/:bookingId/cancel",
  validateRequest(CancelBookingDto),
  bookingController.cancelBooking
);

export default router;

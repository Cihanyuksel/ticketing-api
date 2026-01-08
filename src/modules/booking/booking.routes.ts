import { Router } from "express";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { TicketRepository } from "../ticket/ticket.repository";
import { BookingRepository } from "./booking.repository";
import { LockService } from "../../common/lock.service";
import { PricingCalculatorService } from "../event/services/pricing-calculater.service";
import {
  CreateBookingDto,
  CancelBookingDto,
  GetBookingDto,
} from "./booking.dto";
import { validateRequest } from "../../common/middleware/validate-request";

const router = Router();

const lockService = new LockService();
const pricingCalculator = new PricingCalculatorService();

const bookingService = new BookingService(
  TicketRepository,
  BookingRepository,
  lockService,
  pricingCalculator
);

const bookingController = new BookingController(bookingService);

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

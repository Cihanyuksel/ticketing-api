import { Router } from "express";
import { BookingController } from "./booking.controller";

const router = Router();
const controller = new BookingController();

router.post("/", controller.createBooking);
router.get("/:bookingId", controller.getBooking);
router.patch("/:bookingId/cancel", controller.cancelBooking);

export default router;

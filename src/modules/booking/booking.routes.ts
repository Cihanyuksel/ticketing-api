import { Router } from "express";
import { BookingController } from "./booking.controller";

const router = Router();
const controller = new BookingController();

router.post("/", controller.createBooking);
router.get("/:bookingId", controller.getBooking);

export default router;

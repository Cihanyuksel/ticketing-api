import express from "express";
import helmet from "helmet";
import cors from "cors";
import venueRoutes from "./modules/venue/venue.routes";
import ticketRoutes from "./modules/ticket/ticket.routes";
import authRoutes from "./modules/auth/auth.routes";
import eventRoutes from "./modules/event/event.routes";
import bookingRoutes from "./modules/booking/booking.routes";
import {
  errorHandler,
  notFoundHandler,
} from "./common/middleware/error-handler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/tickets", ticketRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes); 

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

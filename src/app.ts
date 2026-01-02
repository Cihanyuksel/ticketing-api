import express from "express";
import helmet from "helmet";
import cors from "cors";
import venueRoutes from "./modules/venue/routes/venue.routes";
import ticketRoutes from "./routes/ticket-route";
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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

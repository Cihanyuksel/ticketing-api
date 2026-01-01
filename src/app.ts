import express from "express";
import helmet from "helmet";
import cors from "cors";
import venueRoutes from "./routes/venue-route"; // Import et
import ticketRoutes from "./routes/ticket-route"; // Import et

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/tickets", ticketRoutes);
app.use("/api/venues", venueRoutes)

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

export default app;

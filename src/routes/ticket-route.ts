import { Router } from "express";
import { TicketController } from "../controllers/ticket-controller";
import { TicketService } from "../services/ticket-services";

const router = Router();
const ticketService = new TicketService();

const ticketController = new TicketController(ticketService);

// POST http://localhost:3000/api/tickets/lock
router.post("/lock", ticketController.lockSeat);

// POST http://localhost:3000/api/tickets/purchase
router.post("/purchase", ticketController.purchaseTicket);

export default router;

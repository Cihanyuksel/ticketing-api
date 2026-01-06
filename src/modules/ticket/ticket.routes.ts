import { Router } from "express";
import { TicketController } from "./ticket.controller";

const router = Router();
const ticketController = new TicketController();

// POST /api/tickets/issue
router.post("/issue", ticketController.issueTicket);

export default router;

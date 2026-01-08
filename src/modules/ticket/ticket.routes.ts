import { Router } from "express";
import { TicketController } from "./ticket.controller";
import { TicketService } from "./ticket.services";
import { LockService } from "../../common/lock.service";
import { IssueTicketDto } from "./ticket.dto";
import { validateRequest } from "../../common/middleware/validate-request";

const router = Router();

const lockService = new LockService();
const ticketService = new TicketService(undefined, undefined, lockService);
const ticketController = new TicketController(ticketService);

// POST /api/tickets/issue
router.post(
  "/issue",
  validateRequest(IssueTicketDto),
  ticketController.issueTicket
);

export default router;

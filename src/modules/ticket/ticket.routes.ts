import { Router } from "express";
import { TicketModule } from "./ticket.module";
import { IssueTicketDto } from "./ticket.dto";
import { validateRequest } from "../../common/middleware/validate-request";

const router = Router();

const ticketController = TicketModule.getController();

// POST /api/tickets/issue
router.post(
  "/issue",
  validateRequest(IssueTicketDto),
  ticketController.issueTicket
);

export default router;

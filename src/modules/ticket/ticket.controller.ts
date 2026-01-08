import { Request, Response } from "express";
import { TicketService } from "./ticket.services";
import { asyncHandlerWithThis } from "../../common/middleware/async-handler";
import { ApiResponse } from "../../common/responses/api-response";
import { IssueTicketDto } from "./ticket.dto";

export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  // POST /tickets/issue
  issueTicket = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const dto: IssueTicketDto = req.body;

      const ticket = await this.ticketService.issueTicket(dto.bookingId);

      return ApiResponse.created(res, ticket, "Bilet başarıyla oluşturuldu.");
    }
  );
}

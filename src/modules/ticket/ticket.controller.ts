import { Request, Response } from "express";
import { TicketService } from "./ticket.services";
import { asyncHandlerWithThis } from "../../common/middleware/async-handler";
import { ApiResponse } from "../../common/responses/api-response";

export class TicketController {
  private ticketService = new TicketService();

  // POST /tickets/issue
  issueTicket = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { bookingId } = req.body;

      if (!bookingId) {
        throw new Error("Booking ID gereklidir.");
      }

      const ticket = await this.ticketService.issueTicket(bookingId);

      return ApiResponse.created(res, ticket, "Bilet başarıyla oluşturuldu.");
    }
  );
}

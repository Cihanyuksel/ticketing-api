import { AppDataSource } from "../../config/db";
import { Ticket, TicketStatus } from "./ticket.entity";

export const TicketRepository = AppDataSource.getRepository(Ticket).extend({
  async findSoldTicket(
    sessionId: string,
    seatId: string
  ): Promise<Ticket | null> {
    return this.createQueryBuilder("ticket")
      .where("ticket.sessionId = :sessionId", { sessionId })
      .andWhere("ticket.seat_id = :seatId", { seatId })
      .andWhere("ticket.status != :cancelledStatus", {
        cancelledStatus: TicketStatus.CANCELLED,
      })
      .getOne();
  },
});

import { Ticket } from "./ticket.entity";

export interface ITicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findOne(options: any): Promise<Ticket | null>;
  find(options?: any): Promise<Ticket[]>;
  create(data: Partial<Ticket>): Ticket;
  save(ticket: Ticket): Promise<Ticket>;
  remove(ticket: Ticket): Promise<void>;
  findSoldTicket(sessionId: string, seatId: string): Promise<Ticket | null>;
}

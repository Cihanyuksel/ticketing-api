import { Repository } from "typeorm";
import { AppDataSource } from "../../config/db";
import { Ticket, TicketStatus } from "./ticket.entity";
import { ITicketRepository } from "./ticket.repository.interface";

export class TicketRepository implements ITicketRepository {
  private repo: Repository<Ticket>;

  constructor() {
    this.repo = AppDataSource.getRepository(Ticket);
  }

  async findById(id: string): Promise<Ticket | null> {
    return await this.repo.findOneBy({ id });
  }

  async findOne(options: any): Promise<Ticket | null> {
    return await this.repo.findOne(options);
  }

  async find(options?: any): Promise<Ticket[]> {
    return await this.repo.find(options);
  }

  create(data: Partial<Ticket>): Ticket {
    return this.repo.create(data);
  }

  async save(ticket: Ticket): Promise<Ticket> {
    return await this.repo.save(ticket);
  }

  async remove(ticket: Ticket): Promise<void> {
    await this.repo.remove(ticket);
  }

  async findSoldTicket(
    sessionId: string,
    seatId: string
  ): Promise<Ticket | null> {
    return await this.repo
      .createQueryBuilder("ticket")
      .where("ticket.sessionId = :sessionId", { sessionId })
      .andWhere("ticket.seat_id = :seatId", { seatId })
      .andWhere("ticket.status != :cancelledStatus", {
        cancelledStatus: TicketStatus.CANCELLED,
      })
      .getOne();
  }
}

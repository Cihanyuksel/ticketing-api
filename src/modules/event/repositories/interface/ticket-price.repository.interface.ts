import { TicketPrice } from "../../entities/ticket-price.entity";

export interface ITicketPriceRepository {
  findById(id: string): Promise<TicketPrice | null>;
  findOne(options: any): Promise<TicketPrice | null>;
  find(options?: any): Promise<TicketPrice[]>;
  create(data: Partial<TicketPrice>): TicketPrice;
  save(price: TicketPrice): Promise<TicketPrice>;
  saveMany(prices: TicketPrice[]): Promise<TicketPrice[]>;
  remove(price: TicketPrice): Promise<void>;
}

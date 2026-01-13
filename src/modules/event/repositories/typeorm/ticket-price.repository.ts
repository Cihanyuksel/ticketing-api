import { Repository } from "typeorm";
import { AppDataSource } from "../../../../config/db";
import { TicketPrice } from "../../entities/ticket-price.entity";
import { ITicketPriceRepository } from "../interface/ticket-price.repository.interface";

export class TicketPriceRepository implements ITicketPriceRepository {
  private repo: Repository<TicketPrice>;

  constructor() {
    this.repo = AppDataSource.getRepository(TicketPrice);
  }

  async findById(id: string): Promise<TicketPrice | null> {
    return await this.repo.findOneBy({ id });
  }
  async findOne(options: any): Promise<TicketPrice | null> {
    return await this.repo.findOne(options);
  }
  async find(options?: any): Promise<TicketPrice[]> {
    return await this.repo.find(options);
  }
  create(data: Partial<TicketPrice>): TicketPrice {
    return this.repo.create(data);
  }
  async save(price: TicketPrice): Promise<TicketPrice> {
    return await this.repo.save(price);
  }
  async saveMany(prices: TicketPrice[]): Promise<TicketPrice[]> {
    return await this.repo.save(prices);
  }
  async remove(price: TicketPrice): Promise<void> {
    await this.repo.remove(price);
  }
}

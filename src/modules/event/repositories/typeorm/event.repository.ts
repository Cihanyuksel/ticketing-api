// modules/event/infrastructure/repositories/typeorm-event.repository.ts
import { Repository } from "typeorm";
import { AppDataSource } from "../../../../config/db";
import { Event } from "../../entities/event.entity";
import { IEventRepository } from "../interface/event.repository.interface";

export class EventRepository implements IEventRepository {
  private repo: Repository<Event>;

  constructor() {
    this.repo = AppDataSource.getRepository(Event);
  }

  async findById(id: string): Promise<Event | null> {
    return await this.repo.findOneBy({ id });
  }
  async findOne(options: any): Promise<Event | null> {
    return await this.repo.findOne(options);
  }
  async find(options?: any): Promise<Event[]> {
    return await this.repo.find(options);
  }
  create(data: Partial<Event>): Event {
    return this.repo.create(data);
  }
  async save(event: Event): Promise<Event> {
    return await this.repo.save(event);
  }
  async remove(event: Event): Promise<void> {
    await this.repo.remove(event);
  }
}
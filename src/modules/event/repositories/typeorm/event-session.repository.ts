import { Repository } from "typeorm";
import { AppDataSource } from "../../../../config/db";
import { EventSession } from "../../entities/event-session.entity";
import { IEventSessionRepository } from "../interface/event-session.repository.interface";

export class EventSessionRepository implements IEventSessionRepository {
  private repo: Repository<EventSession>;

  constructor() {
    this.repo = AppDataSource.getRepository(EventSession);
  }

  async findById(id: string): Promise<EventSession | null> {
    return await this.repo.findOneBy({ id });
  }
  async findOne(options: any): Promise<EventSession | null> {
    return await this.repo.findOne(options);
  }
  async find(options?: any): Promise<EventSession[]> {
    return await this.repo.find(options);
  }
  create(data: Partial<EventSession>): EventSession {
    return this.repo.create(data);
  }
  async save(session: EventSession): Promise<EventSession> {
    return await this.repo.save(session);
  }
  async remove(session: EventSession): Promise<void> {
    await this.repo.remove(session);
  }
}

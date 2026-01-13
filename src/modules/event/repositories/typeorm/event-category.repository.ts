import { Repository } from "typeorm";
import { AppDataSource } from "../../../../config/db";
import { EventCategory } from "../../entities/event-category.entity";
import { IEventCategoryRepository } from "../interface/event-category.repository.interface";

export class EventCategoryRepository implements IEventCategoryRepository {
  private repo: Repository<EventCategory>;

  constructor() {
    this.repo = AppDataSource.getRepository(EventCategory);
  }

  async findById(id: string): Promise<EventCategory | null> {
    return await this.repo.findOneBy({ id });
  }

  async findOne(options: any): Promise<EventCategory | null> {
    return await this.repo.findOne(options);
  }

  async find(options?: any): Promise<EventCategory[]> {
    return await this.repo.find(options);
  }

  create(data: Partial<EventCategory>): EventCategory {
    return this.repo.create(data);
  }

  async save(category: EventCategory): Promise<EventCategory> {
    return await this.repo.save(category);
  }

  async remove(category: EventCategory): Promise<void> {
    await this.repo.remove(category);
  }
}

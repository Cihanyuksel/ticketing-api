import { EventCategory } from "../../entities/event-category.entity";

export interface IEventCategoryRepository {
  findById(id: string): Promise<EventCategory | null>;
  findOne(options: any): Promise<EventCategory | null>;
  find(options?: any): Promise<EventCategory[]>;
  create(data: Partial<EventCategory>): EventCategory;
  save(category: EventCategory): Promise<EventCategory>;
  remove(category: EventCategory): Promise<void>;
}

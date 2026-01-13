import { Event } from "../../entities/event.entity";

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findOne(options: any): Promise<Event | null>;
  find(options?: any): Promise<Event[]>;
  create(data: Partial<Event>): Event;
  save(event: Event): Promise<Event>;
  remove(event: Event): Promise<void>;
}

import { EventSession } from "../../entities/event-session.entity";

export interface IEventSessionRepository {
  findById(id: string): Promise<EventSession | null>;
  findOne(options: any): Promise<EventSession | null>;
  find(options?: any): Promise<EventSession[]>;
  create(data: Partial<EventSession>): EventSession;
  save(session: EventSession): Promise<EventSession>;
  remove(session: EventSession): Promise<void>;
}

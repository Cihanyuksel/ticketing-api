import { Event, EventType, PricingStrategyType } from "./Event";
import { Venue } from "../../modules/venue/entities/venue.entity";

interface CreateEventDTO {
  name: string;
  description: string;
  date: Date;
  venue: Venue;
  pricingStrategy?: PricingStrategyType;
}

export class EventFactory {
  static create(type: EventType, data: CreateEventDTO): Event {
    const event = new Event();

    event.name = data.name;
    event.description = data.description;
    event.date = data.date;
    event.venue = data.venue;
    event.type = type;

    switch (type) {
      case EventType.THEATER:
        event.pricingStrategy = PricingStrategyType.STANDARD;
        break;

      case EventType.CONCERT:
        event.pricingStrategy =
          data.pricingStrategy || PricingStrategyType.SURGE;
        break;

      default:
        event.pricingStrategy = PricingStrategyType.STANDARD;
        break;
    }

    return event;
  }
}

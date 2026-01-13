import redisClient from "../../config/redis";
import { TypeOrmVenueRepository } from "../venue/repository";
import { EventController } from "./event.controller";
import { EventCategoryRepository } from "./repositories/typeorm/event-category.repository";
import { EventSessionRepository } from "./repositories/typeorm/event-session.repository";
import { EventRepository } from "./repositories/typeorm/event.repository";
import { PricingRuleRepository } from "./repositories/typeorm/pricing-rule.repository";
import { TicketPriceRepository } from "./repositories/typeorm/ticket-price.repository";
import { EventService } from "./services/event.services";
import { PricingCalculatorService } from "./services/pricing-calculater.service";


export class EventModule {
  static getController(): EventController {
    // Repository instances
    const eventRepo = new EventRepository();
    const sessionRepo = new EventSessionRepository();
    const priceRepo = new TicketPriceRepository();
    const categoryRepo = new EventCategoryRepository();
    const ruleRepo = new PricingRuleRepository();

    // Service instances
    const pricingCalculator = new PricingCalculatorService(
      sessionRepo,
      priceRepo,
      ruleRepo,
      redisClient
    );

    const venueRepo = new TypeOrmVenueRepository();

    const eventService = new EventService(
      eventRepo,
      sessionRepo,
      priceRepo,
      categoryRepo,
      venueRepo,
      ruleRepo,
      pricingCalculator
    );

    return new EventController(eventService);
  }
}
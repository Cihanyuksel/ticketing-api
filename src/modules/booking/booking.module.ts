import { LockService } from "../../common/lock.service";
import redisClient from "../../config/redis";
import { EventSessionRepository } from "../event/repositories/typeorm/event-session.repository";
import { PricingRuleRepository } from "../event/repositories/typeorm/pricing-rule.repository";
import { TicketPriceRepository } from "../event/repositories/typeorm/ticket-price.repository";
import { PricingCalculatorService } from "../event/services/pricing-calculater.service";
import { TicketRepository } from "../ticket/ticket.repository";
import { BookingController } from "./booking.controller";
import { BookingRepository } from "./booking.repository";
import { BookingService } from "./booking.service";

export class BookingModule {
  static getController(): BookingController {
    const lockService = new LockService();

    // Pricing calculator
    const sessionRepo = new EventSessionRepository();
    const priceRepo = new TicketPriceRepository();
    const ruleRepo = new PricingRuleRepository();

    const pricingCalculator = new PricingCalculatorService(
      sessionRepo,
      priceRepo,
      ruleRepo,
      redisClient
    );

    // Booking
    const ticketRepo = new TicketRepository();
    const bookingRepo = new BookingRepository();

    const bookingService = new BookingService(
      ticketRepo,
      bookingRepo,
      lockService,
      pricingCalculator,
      redisClient
    );

    return new BookingController(bookingService);
  }
}

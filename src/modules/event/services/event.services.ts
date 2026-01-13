import { Event } from "../entities/event.entity";
import { EventSession } from "../entities/event-session.entity";
import { TicketPrice } from "../entities/ticket-price.entity";
import { EventCategory } from "../entities/event-category.entity";
import {
  CreateEventDTO,
  CreateSessionDTO,
  AddPricesDTO,
  UpdateEventDTO,
  UpdateSessionDTO,
  CreatePricingRuleDTO,
  UpdatePricingRuleDTO,
} from "../event.dto";
import {
  NotFoundError,
  BadRequestError,
} from "../../../common/errors/app.error";
import { PricingCalculatorService } from "./pricing-calculater.service";
import { EventType, PricingStrategyType } from "../entities/enum";
import { IEventRepository } from "../repositories/interface/event.repository.interface";
import { IEventSessionRepository } from "../repositories/interface/event-session.repository.interface";
import { ITicketPriceRepository } from "../repositories/interface/ticket-price.repository.interface";
import { IEventCategoryRepository } from "../repositories/interface/event-category.repository.interface";
import { IPricingRuleRepository } from "../repositories/interface/pricing-rule.repository.interface";
import { IVenueRepository } from "../../venue/repository/venue.repository.interface";
import { PricingRule } from "../entities/pricing-rules.entity";

export class EventService {
  constructor(
    private eventRepo: IEventRepository,
    private sessionRepo: IEventSessionRepository,
    private priceRepo: ITicketPriceRepository,
    private categoryRepo: IEventCategoryRepository,
    private venueRepo: IVenueRepository,
    private ruleRepo: IPricingRuleRepository,
    private pricingCalculator: PricingCalculatorService
  ) {}

  // EVENT
  async createEvent(data: CreateEventDTO): Promise<Event> {
    const category = await this.categoryRepo.findById(data.categoryId);
    if (!category) throw new NotFoundError("Kategori bulunamadı");

    const event = this.eventRepo.create({
      title: data.title,
      description: data.description,
      type: data.type,
      performer: data.performer,
      imageUrl: data.imageUrl,
      category: category,
      status: "DRAFT" as any,
    });

    return await this.eventRepo.save(event);
  }

  async getEvents() {
    return await this.eventRepo.find({
      relations: ["category", "sessions", "sessions.venue"],
    });
  }

  async getEventById(eventId: string) {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ["category", "sessions", "sessions.venue", "sessions.prices"],
    });

    if (!event) throw new NotFoundError("Etkinlik", eventId);
    return event;
  }

  async updateEvent(eventId: string, data: UpdateEventDTO): Promise<Event> {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundError("Etkinlik", eventId);

    if (data.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category) throw new NotFoundError("Kategori");
      event.category = category;
    }

    Object.assign(event, data);
    return await this.eventRepo.save(event);
  }

  async deleteEvent(eventId: string): Promise<void> {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundError("Etkinlik", eventId);
    await this.eventRepo.remove(event);
  }

  // SESSION
  async createSession(data: CreateSessionDTO): Promise<EventSession> {
    const event = await this.eventRepo.findById(data.eventId);
    if (!event) throw new NotFoundError("Etkinlik bulunamadı");

    const venue = await this.venueRepo.findById(data.venueId);
    if (!venue) throw new NotFoundError("Mekan bulunamadı");

    if (new Date(data.startTime) >= new Date(data.endTime)) {
      throw new BadRequestError("Bitiş zamanı başlangıçtan önce olamaz.");
    }

    let strategyToUse = data.pricingStrategy;

    if (!strategyToUse) {
      strategyToUse =
        event.type === EventType.CONCERT
          ? PricingStrategyType.SURGE
          : PricingStrategyType.STANDARD;
    }

    const session = this.sessionRepo.create({
      event,
      venue,
      startTime: data.startTime,
      endTime: data.endTime,
      pricingStrategy: strategyToUse,
      isActive: true,
    });

    return await this.sessionRepo.save(session);
  }

  async getSessionDetails(sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ["event", "venue", "prices", "prices.section", "pricingRules"],
    });

    if (!session) throw new NotFoundError("Oturum", sessionId);
    return session;
  }

  async updateSession(
    sessionId: string,
    data: UpdateSessionDTO
  ): Promise<EventSession> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new NotFoundError("Oturum", sessionId);

    if (data.startTime && data.endTime) {
      if (new Date(data.startTime) >= new Date(data.endTime)) {
        throw new BadRequestError("Bitiş zamanı başlangıçtan önce olamaz.");
      }
    }

    Object.assign(session, data);
    return await this.sessionRepo.save(session);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new NotFoundError("Oturum", sessionId);
    await this.sessionRepo.remove(session);
  }

  // PRICING
  async addPricesToSession(data: AddPricesDTO): Promise<TicketPrice[]> {
    const session = await this.sessionRepo.findOne({
      where: { id: data.sessionId },
      relations: ["venue"],
    });

    if (!session) throw new NotFoundError("Oturum bulunamadı");

    const prices = data.prices.map((item) =>
      this.priceRepo.create({
        name: item.name,
        amount: item.amount,
        session: session,
        currency: "TRY",
        sectionId: item.sectionId,
      })
    );

    return await this.priceRepo.saveMany(prices);
  }

  // PRICING CALCULATION
  async calculatePrice(
    sessionId: string,
    priceId: string,
    userContext: { userId?: string; userAge?: number; ticketQuantity: number }
  ) {
    return await this.pricingCalculator.calculateFinalPrice(
      sessionId,
      priceId,
      userContext
    );
  }

  async calculateSessionPrices(sessionId: string) {
    return await this.pricingCalculator.calculateAllPricesForSession(sessionId);
  }

  // PRICING RULES
  async createPricingRule(data: CreatePricingRuleDTO): Promise<PricingRule> {
    const session = await this.sessionRepo.findById(data.sessionId);
    if (!session) throw new NotFoundError("Oturum", data.sessionId);

    const rule = this.ruleRepo.create({
      name: data.name,
      description: data.description,
      type: data.type,
      value: data.value,
      conditions: data.conditions || {},
      priority: data.priority || 0,
      session: session,
      isActive: true,
    });

    return await this.ruleRepo.save(rule);
  }

  async getPricingRulesBySession(sessionId: string): Promise<PricingRule[]> {
    return await this.ruleRepo.find({
      where: { sessionId },
      order: { priority: "DESC" },
    });
  }

  async updatePricingRule(
    ruleId: string,
    data: UpdatePricingRuleDTO
  ): Promise<PricingRule> {
    const rule = await this.ruleRepo.findById(ruleId);
    if (!rule) throw new NotFoundError("Fiyatlandırma kuralı", ruleId);

    Object.assign(rule, data);
    return await this.ruleRepo.save(rule);
  }

  async deletePricingRule(ruleId: string): Promise<void> {
    const rule = await this.ruleRepo.findById(ruleId);
    if (!rule) throw new NotFoundError("Fiyatlandırma kuralı", ruleId);
    await this.ruleRepo.remove(rule);
  }

  // CATEGORY
  async createCategory(data: {
    name: string;
    slug: string;
  }): Promise<EventCategory> {
    const existing = await this.categoryRepo.findOne({
      where: [{ name: data.name }, { slug: data.slug }],
    });

    if (existing) {
      throw new BadRequestError(
        "Bu isimde veya slug'da bir kategori zaten var."
      );
    }

    const category = this.categoryRepo.create({
      name: data.name,
      slug: data.slug,
    });

    return await this.categoryRepo.save(category);
  }
}

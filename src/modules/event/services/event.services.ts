import { AppDataSource } from "../../../config/db";
import { Event } from "../entities/event.entity";
import { EventSession } from "../entities/event-session.entity";
import { TicketPrice } from "../entities/ticket-price.entity";
import { EventCategory } from "../entities/event-category.entity";
import { PricingRule } from "../entities/pricing-rules.entity";
import { Venue } from "../../venue/entities/venue.entity";
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

export class EventService {
  private eventRepo = AppDataSource.getRepository(Event);
  private sessionRepo = AppDataSource.getRepository(EventSession);
  private priceRepo = AppDataSource.getRepository(TicketPrice);
  private categoryRepo = AppDataSource.getRepository(EventCategory);
  private venueRepo = AppDataSource.getRepository(Venue);
  private ruleRepo = AppDataSource.getRepository(PricingRule);
  private pricingCalculator = new PricingCalculatorService();

  // =================================================
  // EVENT
  // =================================================
  async createEvent(data: CreateEventDTO): Promise<Event> {
    const category = await this.categoryRepo.findOneBy({ id: data.categoryId });
    if (!category) throw new NotFoundError("Kategori bulunamadı");

    const event = Event.create({
      title: data.title,
      description: data.description,
      type: data.type,
      performer: data.performer,
      imageUrl: data.imageUrl,
      category: category,
      status: "DRAFT" as any,
    });

    return await event.save();
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
    const event = await this.eventRepo.findOneBy({ id: eventId });
    if (!event) throw new NotFoundError("Etkinlik", eventId);

    if (data.categoryId) {
      const category = await this.categoryRepo.findOneBy({
        id: data.categoryId,
      });
      if (!category) throw new NotFoundError("Kategori");
      event.category = category;
    }

    Object.assign(event, data);
    return await event.save();
  }

  async deleteEvent(eventId: string): Promise<void> {
    const event = await this.eventRepo.findOneBy({ id: eventId });
    if (!event) throw new NotFoundError("Etkinlik", eventId);
    await event.remove();
  }

  // =================================================
  // SESSION
  // =================================================
  async createSession(data: CreateSessionDTO): Promise<EventSession> {
    const event = await this.eventRepo.findOneBy({ id: data.eventId });
    if (!event) throw new NotFoundError("Etkinlik bulunamadı");

    const venue = await this.venueRepo.findOneBy({ id: data.venueId });
    if (!venue) throw new NotFoundError("Mekan bulunamadı");

    if (new Date(data.startTime) >= new Date(data.endTime)) {
      throw new BadRequestError("Bitiş zamanı başlangıçtan önce olamaz.");
    }

    let strategyToUse = data.pricingStrategy;

    if (!strategyToUse) {
      if (event.type === EventType.CONCERT) {
        strategyToUse = PricingStrategyType.SURGE;
      } else {
        strategyToUse = PricingStrategyType.STANDARD;
      }
    }

    const session = EventSession.create({
      event,
      venue,
      startTime: data.startTime,
      endTime: data.endTime,
      pricingStrategy: strategyToUse,
      isActive: true,
    });

    return await session.save();
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
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundError("Oturum", sessionId);

    if (data.startTime && data.endTime) {
      if (new Date(data.startTime) >= new Date(data.endTime)) {
        throw new BadRequestError("Bitiş zamanı başlangıçtan önce olamaz.");
      }
    }

    Object.assign(session, data);
    return await session.save();
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundError("Oturum", sessionId);
    await session.remove();
  }

  // =================================================
  // PRICING
  // =================================================
  async addPricesToSession(data: AddPricesDTO): Promise<TicketPrice[]> {
    const session = await this.sessionRepo.findOne({
      where: { id: data.sessionId },
      relations: ["venue"],
    });

    if (!session) throw new NotFoundError("Oturum bulunamadı");

    const savedPrices: TicketPrice[] = [];

    for (const item of data.prices) {
      const price = this.priceRepo.create({
        name: item.name,
        amount: item.amount,
        session: session,
        currency: "TRY",
        sectionId: item.sectionId,
      });

      savedPrices.push(await this.priceRepo.save(price));
    }

    return savedPrices;
  }

  // =================================================
  // PRICING CALCULATION
  // =================================================
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

  // =================================================
  // PRICING RULES
  // =================================================
  async createPricingRule(data: CreatePricingRuleDTO): Promise<PricingRule> {
    const session = await this.sessionRepo.findOneBy({ id: data.sessionId });
    if (!session) throw new NotFoundError("Oturum", data.sessionId);

    const rule = PricingRule.create({
      name: data.name,
      description: data.description,
      type: data.type,
      value: data.value,
      conditions: data.conditions || {},
      priority: data.priority || 0,
      session: session,
      isActive: true,
    });

    return await rule.save();
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
    const rule = await this.ruleRepo.findOneBy({ id: ruleId });
    if (!rule) throw new NotFoundError("Fiyatlandırma kuralı", ruleId);

    Object.assign(rule, data);
    return await rule.save();
  }

  async deletePricingRule(ruleId: string): Promise<void> {
    const rule = await this.ruleRepo.findOneBy({ id: ruleId });
    if (!rule) throw new NotFoundError("Fiyatlandırma kuralı", ruleId);
    await rule.remove();
  }

  // =================================================
  // CATEGORY
  // =================================================
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

    return await category.save();
  }
}

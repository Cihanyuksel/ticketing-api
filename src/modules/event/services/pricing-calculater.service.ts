import { AppDataSource } from "../../../config/db";
import { EventSession } from "../entities/event-session.entity";
import { TicketPrice } from "../entities/ticket-price.entity";
import { PricingRule } from "../entities/pricing-rules.entity";
import { PricingContext } from "../strategies/pricing-strategy.interface";
import { PricingStrategyFactory } from "../strategies/pricing-strategy.factory";
import { NotFoundError } from "../../../common/errors/app.error";
import { RuleType } from "../entities/enum";

export interface UserContext {
  userId?: string;
  userAge?: number;
  ticketQuantity: number;
  purchaseDate?: Date;
}

export class PricingCalculatorService {
  private sessionRepo = AppDataSource.getRepository(EventSession);
  private priceRepo = AppDataSource.getRepository(TicketPrice);
  private ruleRepo = AppDataSource.getRepository(PricingRule);

  // Returns how many seats are already booked for the session
  async getBookedSeatsCount(sessionId: string): Promise<number> {
    return 0;
  }

  // Returns remaining time until event start (in minutes)
  getMinutesUntilEvent(eventDate: Date): number {
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    return Math.floor(diff / 60000);
  }

  // Calculates final ticket price using strategy + pricing rules
  async calculateFinalPrice(
    sessionId: string,
    basePriceId: string,
    userContext: UserContext
  ): Promise<{
    basePrice: number;
    strategyPrice: number;
    finalPrice: number;
    appliedStrategy: string;
    appliedRules: Array<{ name: string; discount: number }>;
    totalDiscount: number;
  }> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ["venue", "prices"],
    });

    if (!session) throw new NotFoundError("Oturum", sessionId);

    const basePrice = session.prices.find((p) => p.id === basePriceId);
    if (!basePrice) throw new NotFoundError("Fiyat", basePriceId);

    const context: PricingContext = {
      sessionId,
      totalSeats: session.venue.totalCapacity,
      soldSeats: await this.getBookedSeatsCount(sessionId),
      timeUntilEvent: this.getMinutesUntilEvent(session.startTime),
    };

    const strategy = PricingStrategyFactory.getStrategy(
      session.pricingStrategy
    );
    const strategyPrice = strategy.calculatePrice(basePrice.amount, context);

    const { finalPrice, appliedRules, totalDiscount } =
      await this.applyPricingRules(sessionId, strategyPrice, userContext);

    return {
      basePrice: basePrice.amount,
      strategyPrice,
      finalPrice,
      appliedStrategy: session.pricingStrategy,
      appliedRules,
      totalDiscount,
    };
  }

  // Applies active pricing rules in priority order
  private async applyPricingRules(
    sessionId: string,
    currentPrice: number,
    userContext: UserContext
  ): Promise<{
    finalPrice: number;
    appliedRules: Array<{ name: string; discount: number }>;
    totalDiscount: number;
  }> {
    const rules = await this.ruleRepo.find({
      where: { sessionId, isActive: true },
      order: { priority: "DESC" },
    });

    if (rules.length === 0) {
      return {
        finalPrice: currentPrice,
        appliedRules: [],
        totalDiscount: 0,
      };
    }

    let finalPrice = currentPrice;
    const appliedRules: Array<{ name: string; discount: number }> = [];
    let totalDiscount = 0;

    for (const rule of rules) {
      if (!this.checkRuleConditions(rule, userContext)) continue;

      const beforePrice = finalPrice;
      finalPrice = this.applyRule(rule, finalPrice, userContext);
      const discount = beforePrice - finalPrice;

      if (discount > 0) {
        appliedRules.push({ name: rule.name, discount });
        totalDiscount += discount;
      }
    }

    return { finalPrice, appliedRules, totalDiscount };
  }

  // Checks whether rule conditions match the user context
  private checkRuleConditions(
    rule: PricingRule,
    userContext: UserContext
  ): boolean {
    const conditions = rule.conditions;

    if (conditions.userAge) {
      if (!userContext.userAge) return false;
      if (
        conditions.userAge.max &&
        userContext.userAge > conditions.userAge.max
      )
        return false;
      if (
        conditions.userAge.min &&
        userContext.userAge < conditions.userAge.min
      )
        return false;
    }

    if (
      conditions.minQuantity &&
      userContext.ticketQuantity < conditions.minQuantity
    ) {
      return false;
    }

    if (conditions.validUntil) {
      const validDate = new Date(conditions.validUntil);
      const now = userContext.purchaseDate || new Date();
      if (now > validDate) return false;
    }

    if (conditions.days?.length) {
      const purchaseDay = (userContext.purchaseDate || new Date()).getDay();
      if (!conditions.days.includes(purchaseDay)) return false;
    }

    return true;
  }

  // Applies rule calculation to the current price
  private applyRule(
    rule: PricingRule,
    currentPrice: number,
    userContext: UserContext
  ): number {
    switch (rule.type) {
      case RuleType.PERCENTAGE:
        return currentPrice * (1 - rule.value / 100);

      case RuleType.FIXED_AMOUNT:
        return Math.max(0, currentPrice - rule.value);

      case RuleType.FIXED_PRICE:
        return rule.value;

      case RuleType.BOGO:
        return userContext.ticketQuantity >= 2
          ? currentPrice * 0.5
          : currentPrice;

      default:
        return currentPrice;
    }
  }

  // Calculates strategy-based prices for all ticket types
  async calculateAllPricesForSession(sessionId: string): Promise<{
    sessionId: string;
    strategy: string;
    prices: Array<{
      priceId: string;
      name: string;
      basePrice: number;
      calculatedPrice: number;
      sectionId?: string;
    }>;
  }> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ["venue", "prices", "prices.section"],
    });

    if (!session) throw new NotFoundError("Oturum", sessionId);

    const context: PricingContext = {
      sessionId,
      totalSeats: session.venue.totalCapacity,
      soldSeats: await this.getBookedSeatsCount(sessionId),
      timeUntilEvent: this.getMinutesUntilEvent(session.startTime),
    };

    const strategy = PricingStrategyFactory.getStrategy(
      session.pricingStrategy
    );

    const prices = session.prices.map((price) => ({
      priceId: price.id,
      name: price.name,
      basePrice: price.amount,
      calculatedPrice: strategy.calculatePrice(price.amount, context),
      sectionId: price.sectionId,
    }));

    return {
      sessionId,
      strategy: session.pricingStrategy,
      prices,
    };
  }
}

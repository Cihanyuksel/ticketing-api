import { IPricingStrategy, PricingContext } from "./pricing-strategy.interface";

export class SurgePricingStrategy implements IPricingStrategy {
  calculatePrice(basePrice: number, context: PricingContext): number {
    const soldPercentage = (context.soldSeats / context.totalSeats) * 100;

    if (soldPercentage >= 80) {
      return basePrice * 1.2;
    }

    if (soldPercentage >= 50) {
      return basePrice * 1.1;
    }

    return basePrice;
  }
}

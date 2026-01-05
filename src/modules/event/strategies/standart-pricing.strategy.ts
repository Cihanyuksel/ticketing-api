  import { IPricingStrategy, PricingContext } from "./pricing-strategy.interface";

  export class StandardPricingStrategy implements IPricingStrategy {
    calculatePrice(basePrice: number, context: PricingContext): number {
      return basePrice;
    }
  }

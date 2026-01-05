import { IPricingStrategy } from "./pricing-strategy.interface";
import { SurgePricingStrategy } from "./surge-pricing.strategy";
import { StandardPricingStrategy } from "./standart-pricing.strategy";
import { PricingStrategyType } from "../entities/enum";

export class PricingStrategyFactory {
  private static strategies: Map<PricingStrategyType, IPricingStrategy> =
    new Map([
      [PricingStrategyType.STANDARD, new StandardPricingStrategy()],
      [PricingStrategyType.SURGE, new SurgePricingStrategy()],
    ]);

  static getStrategy(type: PricingStrategyType): IPricingStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Pricing strategy not found: ${type}`);
    }
    return strategy;
  }

  // Create New Strategy
  static registerStrategy(
    type: PricingStrategyType,
    strategy: IPricingStrategy
  ): void {
    this.strategies.set(type, strategy);
  }
}

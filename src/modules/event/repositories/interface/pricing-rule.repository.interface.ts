import { PricingRule } from "../../entities/pricing-rules.entity";

export interface IPricingRuleRepository {
  findById(id: string): Promise<PricingRule | null>;
  findOne(options: any): Promise<PricingRule | null>;
  find(options?: any): Promise<PricingRule[]>;
  create(data: Partial<PricingRule>): PricingRule;
  save(rule: PricingRule): Promise<PricingRule>;
  remove(rule: PricingRule): Promise<void>;
}

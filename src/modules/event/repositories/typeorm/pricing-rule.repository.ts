import { Repository } from "typeorm";
import { AppDataSource } from "../../../../config/db";
import { IPricingRuleRepository } from "../interface/pricing-rule.repository.interface";
import { PricingRule } from "../../entities/pricing-rules.entity";

export class PricingRuleRepository implements IPricingRuleRepository {
  private repo: Repository<PricingRule>;

  constructor() {
    this.repo = AppDataSource.getRepository(PricingRule);
  }

  async findById(id: string): Promise<PricingRule | null> {
    return await this.repo.findOneBy({ id });
  }
  async findOne(options: any): Promise<PricingRule | null> {
    return await this.repo.findOne(options);
  }
  async find(options?: any): Promise<PricingRule[]> {
    return await this.repo.find(options);
  }
  create(data: Partial<PricingRule>): PricingRule {
    return this.repo.create(data);
  }
  async save(rule: PricingRule): Promise<PricingRule> {
    return await this.repo.save(rule);
  }
  async remove(rule: PricingRule): Promise<void> {
    await this.repo.remove(rule);
  }
}

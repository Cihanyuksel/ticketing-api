import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../entity/common/BaseEntity";
import { EventSession } from "./event-session.entity";
import { RuleType } from "./enum";

@Entity("pricing_rules")
export class PricingRule extends BaseEntity {
  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "enum", enum: RuleType })
  type!: RuleType;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  value!: number;

  @Column({ type: "jsonb", default: {} })
  conditions!: Record<string, any>;

  @Column({ default: 0 })
  priority!: number;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => EventSession, (session) => session.pricingRules, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sessionId" })
  session!: EventSession;

  @Column()
  sessionId!: string;
}

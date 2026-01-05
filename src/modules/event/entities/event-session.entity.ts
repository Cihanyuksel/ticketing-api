import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../../../entity/common/BaseEntity";
import { Event } from "./event.entity";
import { Venue } from "../../venue/entities/venue.entity";
import { TicketPrice } from "./ticket-price.entity";
import { PricingRule } from "./pricing-rules.entity";
import { PricingStrategyType } from "./enum";

@Entity("event_sessions")
export class EventSession extends BaseEntity {
  @Column({ type: "timestamp" })
  startTime!: Date;

  @Column({ type: "timestamp" })
  endTime!: Date;

  @Column({ default: true })
  isActive!: boolean;

  @Column({
    type: "enum",
    enum: PricingStrategyType,
    default: PricingStrategyType.STANDARD,
  })
  pricingStrategy!: PricingStrategyType;

  @ManyToOne(() => Event, (event) => event.sessions)
  @JoinColumn({ name: "eventId" })
  event!: Event;

  @Column()
  eventId!: string;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: "venueId" })
  venue!: Venue;

  @Column()
  venueId!: string;

  @OneToMany(() => TicketPrice, (price) => price.session)
  prices!: TicketPrice[];

  @OneToMany(() => PricingRule, (rule) => rule.session)
  pricingRules!: PricingRule[];
}

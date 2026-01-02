import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { Venue } from "../../modules/venue/entities/venue.entity";

export enum PricingStrategyType {
  STANDARD = "STANDARD",
  SURGE = "SURGE",
}

export enum EventType {
  CONCERT = "CONCERT",
  THEATER = "THEATER",
  STANDUP = "STANDUP",
}

@Entity("events")
export class Event extends BaseEntity {
  @Column()
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "timestamp" })
  date!: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  basePrice!: number;

  @Column({
    type: "enum",
    enum: EventType,
    default: EventType.CONCERT,
  })
  type!: EventType;

  @Column({
    type: "enum",
    enum: PricingStrategyType,
    default: PricingStrategyType.STANDARD,
  })
  pricingStrategy!: PricingStrategyType;

  @ManyToOne(() => Venue, { nullable: false })
  @JoinColumn({ name: "venue_id" })
  venue!: Venue;
}

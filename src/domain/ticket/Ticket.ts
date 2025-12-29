import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { Event } from "../event/Event";
import { Seat } from "../venue/Seat";

export enum TicketStatus {
  PAID = "PAID",
  USED = "USED",
  CANCELLED = "CANCELLED",
}

@Entity("tickets")
@Unique(["event", "seat"])
export class Ticket extends BaseEntity {
  @ManyToOne(() => Event, { nullable: false })
  @JoinColumn({ name: "event_id" })
  event!: Event;

  @ManyToOne(() => Seat, { nullable: false })
  @JoinColumn({ name: "seat_id" })
  seat!: Seat;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ default: "TRY" })
  currency!: string;

  @Column({
    type: "enum",
    enum: TicketStatus,
    default: TicketStatus.PAID,
  })
  status!: TicketStatus;

  @Column({ unique: true })
  referenceCode!: string;

  @Column({ type: "text", nullable: true })
  securitySignature?: string;
}

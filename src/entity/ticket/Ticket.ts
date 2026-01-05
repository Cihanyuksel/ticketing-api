import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { Seat } from "../../modules/venue/entities/seat.entity";
import { User } from "../../modules/auth/user.entity";
import { Event } from "../../modules/event/entities/event.entity";

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

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: User;

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

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  purchasedAt!: Date;

  @Column({ unique: true })
  referenceCode!: string;

  @Column({ type: "text", nullable: true })
  securitySignature?: string;
}

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToOne,
} from "typeorm";
import { BaseEntity } from "../../entity/common/BaseEntity";
import { Seat } from "../venue/entities/seat.entity";
import { User } from "../auth/user.entity";
import { EventSession } from "../event/entities/event-session.entity";
import { Booking } from "../booking/booking.entity";

export enum TicketStatus {
  PAID = "PAID",
  USED = "USED",
  CANCELLED = "CANCELLED",
}

@Entity("tickets")
@Unique(["session", "seat"])
export class Ticket extends BaseEntity {
  @ManyToOne(() => EventSession)
  @JoinColumn({ name: "sessionId" })
  session!: EventSession;

  @OneToOne(() => Booking, (booking) => booking.ticket)
  @JoinColumn({ name: "bookingId" })
  booking!: Booking;

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

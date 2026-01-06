import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "../../entity/common/BaseEntity";
import { User } from "../auth/user.entity";
import { EventSession } from "../event/entities/event-session.entity";
import { Seat } from "../venue/entities/seat.entity";
import { Ticket } from "../ticket/ticket.entity";

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  TIMEOUT = "TIMEOUT",
  CANCELLED = "CANCELLED",
}

@Entity("bookings")
export class Booking extends BaseEntity {
  @Column({
    type: "enum",
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus;

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;
  @Column()
  userId!: string;

  @ManyToOne(() => EventSession)
  @JoinColumn({ name: "sessionId" })
  session!: EventSession;
  @Column()
  sessionId!: string;

  @ManyToOne(() => Seat, { nullable: true })
  @JoinColumn({ name: "seatId" })
  seat?: Seat;
  @Column({ nullable: true })
  seatId?: string;

  @OneToOne(() => Ticket, (ticket) => ticket.booking, { nullable: true })
  ticket?: Ticket;
}

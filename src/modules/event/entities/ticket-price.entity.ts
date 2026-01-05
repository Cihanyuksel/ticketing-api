import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../entity/common/BaseEntity";
import { Section } from "../../venue/entities/section.entity";
import { EventSession } from "./event-session.entity";

@Entity("ticket_prices")
export class TicketPrice extends BaseEntity {
  @Column()
  name!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;

  @Column({ default: "TRY" })
  currency!: string;

  @ManyToOne(() => EventSession, (session) => session.prices, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sessionId" })
  session!: EventSession;

  @Column()
  sessionId!: string;

  @ManyToOne(() => Section, { nullable: true })
  @JoinColumn({ name: "sectionId" })
  section?: Section;

  @Column({ nullable: true })
  sectionId?: string;
}

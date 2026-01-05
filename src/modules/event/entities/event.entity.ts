import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../entity/common/BaseEntity";
import { EventCategory } from "./event-category.entity";
import { EventSession } from "./event-session.entity";
import { EventStatus, EventType } from "./enum";

@Entity("events")
export class Event extends BaseEntity {
  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ nullable: true })
  imageUrl!: string;

  @Column({ nullable: true })
  performer!: string;

  @Column({
    type: "enum",
    enum: EventType,
    default: EventType.CONCERT,
  })
  type!: EventType;

  @Column({ type: "enum", enum: EventStatus, default: EventStatus.DRAFT })
  status!: EventStatus;

  @ManyToOne(() => EventCategory, (category) => category.events)
  @JoinColumn({ name: "categoryId" })
  category!: EventCategory;

  @Column()
  categoryId!: string;

  @OneToMany(() => EventSession, (session) => session.event)
  sessions!: EventSession[];
}

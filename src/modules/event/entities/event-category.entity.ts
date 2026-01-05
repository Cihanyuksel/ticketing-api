import { Entity, Column, OneToMany } from "typeorm";
import { Event } from "./event.entity";
import { BaseEntity } from "../../../entity/common/BaseEntity";

@Entity("event_categories")
export class EventCategory extends BaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @OneToMany(() => Event, (event) => event.category)
  events!: Event[];
}

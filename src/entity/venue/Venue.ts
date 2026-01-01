import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { Section } from "./Section";

@Entity("venues")
export class Venue extends BaseEntity {
  @Column()
  name!: string;

  @Column()
  city!: string;

  @Column()
  district!: string;

  @Column("text")
  address!: string;

  @Column({ default: 0, type: "int" })
  totalCapacity!: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  googleMapsLink?: string;

  @OneToMany(() => Section, (section) => section.venue, {
    cascade: true,
  })
  sections!: Section[];
}

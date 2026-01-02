import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../entity/common/BaseEntity";
import { Venue } from "./venue.entity";
import { Row } from "./row.entity";

@Entity("sections")
export class Section extends BaseEntity {
  @Column()
  name!: string;

  @Column()
  capacity!: number;

  @ManyToOne(() => Venue, (venue) => venue.sections, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "venue_id" })
  venue!: Venue;

  @OneToMany(() => Row, (row) => row.section, { cascade: true })
  rows!: Row[];
}

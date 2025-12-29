import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { Venue } from "./Venue";
import { Row } from "./Rows";

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

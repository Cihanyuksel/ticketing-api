import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../../entity/common/BaseEntity";
import { Section } from "./section.entity";
import { Seat } from "./seat.entity";

@Entity("rows")
export class Row extends BaseEntity {
  @Column()
  rowLabel!: string;

  @ManyToOne(() => Section, (section) => section.rows, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "section_id" })
  section!: Section;

  @OneToMany(() => Seat, (seat) => seat.row, { cascade: true })
  seats!: Seat[];
}

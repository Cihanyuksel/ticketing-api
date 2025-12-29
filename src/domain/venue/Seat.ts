import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { Row } from "./Rows";

@Entity("seats")
export class Seat extends BaseEntity {
  @Column()
  seatNumber!: string;

  @ManyToOne(() => Row, (row) => row.seats, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "row_id" })
  row!: Row;
}

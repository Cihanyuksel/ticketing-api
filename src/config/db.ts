import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Seat } from "../domain/venue/Seat";
import { Row } from "../domain/venue/Rows";
import { Section } from "../domain/venue/Section";
import { Venue } from "../domain/venue/Venue";
import { Ticket } from "../domain/ticket/Ticket";
import { Event } from "../domain/event/Event";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: true,
  logging: false,

  entities: [Venue, Section, Row, Seat, Event, Ticket],
  migrations: [],
  subscribers: [],
});

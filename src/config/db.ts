import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Seat } from "../entity/venue/Seat";
import { Row } from "../entity/venue/Rows";
import { Section } from "../entity/venue/Section";
import { Venue } from "../entity/venue/Venue";
import { Ticket } from "../entity/ticket/Ticket";
import { Event } from "../entity/event/Event";
import { User } from "../entity/auth/User";

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

  entities: [Venue, Section, Row, Seat, Event, Ticket, User],
  migrations: [],
  subscribers: [],
});

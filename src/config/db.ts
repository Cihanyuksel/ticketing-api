import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Row } from "../modules/venue/entities/row.entity";
import { Section } from "../modules/venue/entities/section.entity";
import { Venue } from "../modules/venue/entities/venue.entity";
import { Event } from "../modules/event/entities/event.entity";
import { Seat } from "../modules/venue/entities/seat.entity";
import { User } from "../modules/auth/user.entity";
import { EventCategory } from "../modules/event/entities/event-category.entity";
import { EventSession } from "../modules/event/entities/event-session.entity";
import { TicketPrice } from "../modules/event/entities/ticket-price.entity";
import { PricingRule } from "../modules/event/entities/pricing-rules.entity";
import { Booking } from "../modules/booking/booking.entity";
import { Ticket } from "../modules/ticket/ticket.entity";

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

  entities: [
    Venue,
    Section,
    Row,
    Seat,
    Event,
    User,
    EventCategory,
    EventSession,
    TicketPrice,
    PricingRule,
    Booking,
    Ticket
  ],
  migrations: [],
  subscribers: [],
});

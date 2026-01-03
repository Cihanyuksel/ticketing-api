import { VenueController } from "./venue.controller";
import { VenueCacheService } from "./services/venue-cache.service";
import { VenueCapacityService } from "./services/venue-capacity.service";
import { VenueManagerService } from "./services/venue-manager.service";
import { Venue } from "./entities/venue.entity";
import { Section } from "./entities/section.entity";
import { Row } from "./entities/row.entity";
import { Seat } from "./entities/seat.entity";
import { AppDataSource } from "../../config/db";

const venueRepo = AppDataSource.getRepository(Venue);
const sectionRepo = AppDataSource.getRepository(Section);
const rowRepo = AppDataSource.getRepository(Row);
const seatRepo = AppDataSource.getRepository(Seat);

const cacheService = new VenueCacheService();
const capacityService = new VenueCapacityService();

const venueManagerService = new VenueManagerService(
  venueRepo,
  sectionRepo,
  rowRepo,
  seatRepo,
  cacheService,
  capacityService
);

export const venueController = new VenueController(venueManagerService);

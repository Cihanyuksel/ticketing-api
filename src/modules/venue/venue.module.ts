import {
  TypeOrmRowRepository,
  TypeOrmSeatRepository,
  TypeOrmSectionRepository,
  TypeOrmVenueRepository,
} from "./repository";
import {
  VenueCacheService,
  VenueCapacityService,
  VenueManagerService,
} from "./services";
import { VenueController } from "./venue.controller";

// Instantiate repositories
const venueRepo = new TypeOrmVenueRepository();
const sectionRepo = new TypeOrmSectionRepository();
const rowRepo = new TypeOrmRowRepository();
const seatRepo = new TypeOrmSeatRepository();

// Instantiate services
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

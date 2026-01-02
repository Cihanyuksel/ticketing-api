import { Router } from "express";
import { VenueController } from "../controllers/venue.controller";
import { VenueManagerService } from "../services/venue-manager.service";
import {
  CreateVenueDTO,
  UpdateVenueDTO,
  AddSectionDTO,
  UpdateSectionDTO,
  AddRowDTO,
  AddBulkRowsDTO,
  AddSeatDTO,
  AddBulkSeatsDTO,
  UpdateSeatDTO,
} from "../dtos/venue.dto";
import { validateRequest } from "../../../common/middleware/validate-request";

const router = Router();
const venueService = new VenueManagerService();
const venueController = new VenueController(venueService);

// ============================================
// VENUE OPERATIONS
// ============================================
router.post("/", validateRequest(CreateVenueDTO), venueController.createVenue);
router.get("/", venueController.listVenues);
router.get("/:id", venueController.getVenue);
router.patch(
  "/:id",
  validateRequest(UpdateVenueDTO),
  venueController.updateVenue
);

// ============================================
// SECTION OPERATIONS
// ============================================
router.post(
  "/:venueId/sections",
  validateRequest(AddSectionDTO),
  venueController.addSection
);
router.get("/:venueId/sections", venueController.getVenueSections);
router.patch(
  "/sections/:sectionId",
  validateRequest(UpdateSectionDTO),
  venueController.updateSection
);
router.delete("/sections/:sectionId", venueController.deleteSection);

// ============================================
// ROW OPERATIONS
// ============================================
router.post(
  "/sections/:sectionId/rows/bulk",
  validateRequest(AddBulkRowsDTO),
  venueController.addBulkRows
);
router.post(
  "/sections/:sectionId/rows",
  validateRequest(AddRowDTO),
  venueController.addRow
);
router.delete("/rows/:rowId", venueController.deleteRow);

// ============================================
// SEAT OPERATIONS
// ============================================
router.get("/rows/:rowId/seats", venueController.getRowSeats);
router.post(
  "/rows/:rowId/seats/bulk",
  validateRequest(AddBulkSeatsDTO),
  venueController.addBulkSeats
);
router.post(
  "/rows/:rowId/seats",
  validateRequest(AddSeatDTO),
  venueController.addSeat
);
router.patch(
  "/seats/:seatId",
  validateRequest(UpdateSeatDTO),
  venueController.updateSeat
);
router.delete("/seats/:seatId", venueController.deleteSeat);

export default router;

/*
**Venue Operations**
POST   /api/venues              -> Create new venue (CreateVenueDTO)
GET    /api/venues              -> Get all venues
GET    /api/venues/:id          -> Get venue details
PATCH  /api/venues/:id          -> Update venue (UpdateVenueDTO)

**Section Operations**
POST   /api/venues/:venueId/sections          -> Add section (AddSectionDTO)
GET    /api/venues/:venueId/sections          -> List sections
PATCH  /api/venues/sections/:sectionId        -> Update section (UpdateSectionDTO)
DELETE /api/venues/sections/:sectionId        -> Delete section

**Row Operations**
POST   /api/venues/sections/:sectionId/rows        -> Add row (AddRowDTO)
POST   /api/venues/sections/:sectionId/rows/bulk   -> Add bulk rows (AddBulkRowsDTO)
DELETE /api/venues/rows/:rowId                     -> Delete row

**Seat Operations**
GET    /api/venues/rows/:rowId/seats           -> List row seats
POST   /api/venues/rows/:rowId/seats           -> Add seat (AddSeatDTO)
POST   /api/venues/rows/:rowId/seats/bulk      -> Add bulk seats (AddBulkSeatsDTO)
PATCH  /api/venues/seats/:seatId               -> Update seat (UpdateSeatDTO)
DELETE /api/venues/seats/:seatId               -> Delete seat
*/

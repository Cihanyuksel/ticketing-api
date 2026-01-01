import { Router } from "express";
import { VenueController } from "../controllers/venue-controller";
import { VenueAggregateService } from "../services/venue/venue-aggregate-service";

const router = Router();
const venueService = new VenueAggregateService();
const venueController = new VenueController(venueService);

// ============================================
// VENUE OPERATIONS
// ============================================
router.post("/", venueController.createVenue);
router.get("/", venueController.listVenues);
router.get("/:id", venueController.getVenue);
router.patch("/:id", venueController.updateVenue);

// ============================================
// SECTION OPERATIONS
// ============================================
router.post("/:venueId/sections", venueController.addSection);
router.get("/:venueId/sections", venueController.getVenueSections);
router.patch("/sections/:sectionId", venueController.updateSection);
router.delete("/sections/:sectionId", venueController.deleteSection);

// ============================================
// ROW OPERATIONS
// ============================================
router.post("/sections/:sectionId/rows/bulk", venueController.addBulkRows);
router.post("/sections/:sectionId/rows", venueController.addRow);
router.delete("/rows/:rowId", venueController.deleteRow);

// ============================================
// SEAT OPERATIONS
// ============================================
router.get("/rows/:rowId/seats", venueController.getRowSeats);
router.post("/rows/:rowId/seats/bulk", venueController.addBulkSeats);
router.post("/rows/:rowId/seats", venueController.addSeat);
router.patch("/seats/:seatId", venueController.updateSeat);
router.delete("/seats/:seatId", venueController.deleteSeat);

export default router;

/*

**Venue Operations**
POST   /api/venues              -> Create new venue
GET    /api/venues              -> Get all venues
GET    /api/venues/:id          -> Get venue details
PATCH  /api/venues/:id          -> Update venue

**Section Operations**
POST   /api/venues/:venueId/sections          -> Add section
GET    /api/venues/:venueId/sections          -> List sections
PATCH  /api/venues/sections/:sectionId        -> Update section
DELETE /api/venues/sections/:sectionId        -> Delete section

**Row Operations**
POST   /api/venues/sections/:sectionId/rows   -> Add row
DELETE /api/venues/rows/:rowId                -> Delete row
*/

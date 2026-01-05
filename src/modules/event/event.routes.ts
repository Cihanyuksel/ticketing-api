import { Router } from "express";
import { EventController } from "./event.controller";
import {
  CreateEventDTO,
  CreateSessionDTO,
  AddPricesDTO,
  UpdateEventDTO,
  UpdateSessionDTO,
  CreatePricingRuleDTO,
  UpdatePricingRuleDTO,
  CreateCategoryDTO,
} from "./event.dto";
import { validateRequest } from "../../common/middleware/validate-request";

const router = Router();
const controller = new EventController();

// ============================================
// EVENT ROUTES
// ============================================
router.get("/", controller.getEvents);
router.post("/", validateRequest(CreateEventDTO), controller.createEvent);
router.get("/:eventId", controller.getEventById);
router.patch(
  "/:eventId",
  validateRequest(UpdateEventDTO),
  controller.updateEvent
);
router.delete("/:eventId", controller.deleteEvent);

// ============================================
// SESSION ROUTES
// ============================================
router.post(
  "/sessions",
  validateRequest(CreateSessionDTO),
  controller.createSession
);
router.get("/sessions/:sessionId", controller.getSessionDetails);
router.patch(
  "/sessions/:sessionId",
  validateRequest(UpdateSessionDTO),
  controller.updateSession
);
router.delete("/sessions/:sessionId", controller.deleteSession);

// ============================================
// CATEGORY ROUTES
// ============================================
router.post(
  "/categories",
  validateRequest(CreateCategoryDTO),
  controller.createCategory
);

// ============================================
// PRICING ROUTES
// ============================================
router.post(
  "/sessions/prices",
  validateRequest(AddPricesDTO),
  controller.addPrices
);

// ============================================
// PRICING RULES ROUTES
// ============================================
router.post(
  "/rules",
  validateRequest(CreatePricingRuleDTO),
  controller.createPricingRule
);
router.get("/sessions/:sessionId/rules", controller.getPricingRules);
router.patch(
  "/rules/:ruleId",
  validateRequest(UpdatePricingRuleDTO),
  controller.updatePricingRule
);
router.delete("/rules/:ruleId", controller.deletePricingRule);

router.get(
  "/sessions/:sessionId/prices/:priceId/calculate",
  controller.calculatePrice
);

router.get(
  "/sessions/:sessionId/prices/calculate",
  controller.calculateSessionPrices
);

export default router;

/*
**Event Operations**
POST   /api/events                    -> Create event (CreateEventDTO)
GET    /api/events                    -> List all events
GET    /api/events/:eventId           -> Get event details
PATCH  /api/events/:eventId           -> Update event (UpdateEventDTO)
DELETE /api/events/:eventId           -> Delete event

**Session Operations**
POST   /api/events/sessions                  -> Create session (CreateSessionDTO)
GET    /api/events/sessions/:sessionId       -> Get session details
PATCH  /api/events/sessions/:sessionId       -> Update session (UpdateSessionDTO)
DELETE /api/events/sessions/:sessionId       -> Delete session

**Pricing Operations**
POST   /api/events/sessions/prices           -> Add prices to session (AddPricesDTO)

**Pricing Rules Operations**
POST   /api/events/rules                        -> Create pricing rule (CreatePricingRuleDTO)
GET    /api/events/sessions/:sessionId/rules    -> List session rules
PATCH  /api/events/rules/:ruleId                -> Update pricing rule (UpdatePricingRuleDTO)
DELETE /api/events/rules/:ruleId                -> Delete pricing rule

** Dynamic Pricing Operations **
GET    /api/events/sessions/:sessionId/prices/:priceId/calculate  
       -> Calculate single price with user context (query: userAge, ticketQuantity)
       -> Returns: basePrice, strategyPrice, finalPrice, appliedRules, totalDiscount
       
GET    /api/events/sessions/:sessionId/prices/calculate           
       -> Calculate all session prices (strategy only, no user context)
       -> Returns: sessionId, strategy, prices array with calculated values
*/

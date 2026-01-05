import { Request, Response } from "express";
import { EventService } from "./services/event.services";
import { asyncHandlerWithThis } from "../../common/middleware/async-handler";
import { ApiResponse } from "../../common/responses/api-response";

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  // 1. CREATE EVENT
  createEvent = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const event = await this.eventService.createEvent(req.body);
      return ApiResponse.created(res, event, "Event created successfully");
    }
  );

  // 2. CREATE SESSION
  createSession = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const session = await this.eventService.createSession(req.body);
      return ApiResponse.created(res, session, "Session created successfully");
    }
  );

  // 3. ADD PRICES TO SESSION
  addPrices = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const prices = await this.eventService.addPricesToSession(req.body);
      return ApiResponse.created(res, prices, "Prices added successfully");
    }
  );

  // 4. LIST ALL EVENTS
  getEvents = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const events = await this.eventService.getEvents();
      return ApiResponse.success(res, events, "Events listed successfully");
    }
  );

  // 5. GET SESSION DETAILS (Includes prices and rules)
  getSessionDetails = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId } = req.params;
      const session = await this.eventService.getSessionDetails(sessionId);
      return ApiResponse.success(res, session, "Session details retrieved");
    }
  );

  // 6. GET EVENT BY ID
  getEventById = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { eventId } = req.params;
      const event = await this.eventService.getEventById(eventId);
      return ApiResponse.success(res, event, "Event details retrieved");
    }
  );

  // 7. UPDATE EVENT
  updateEvent = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { eventId } = req.params;
      const event = await this.eventService.updateEvent(eventId, req.body);
      return ApiResponse.success(res, event, "Event updated");
    }
  );

  // 8. DELETE EVENT
  deleteEvent = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { eventId } = req.params;
      await this.eventService.deleteEvent(eventId);
      return ApiResponse.success(res, null, "Event deleted");
    }
  );

  // 9. UPDATE SESSION
  updateSession = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId } = req.params;
      const session = await this.eventService.updateSession(
        sessionId,
        req.body
      );
      return ApiResponse.success(res, session, "Session updated");
    }
  );

  // 10. DELETE SESSION
  deleteSession = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId } = req.params;
      await this.eventService.deleteSession(sessionId);
      return ApiResponse.success(res, null, "Session deleted");
    }
  );

  // 11. CREATE CATEGORY
  createCategory = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const category = await this.eventService.createCategory(req.body);
      return ApiResponse.created(
        res,
        category,
        "Category created successfully"
      );
    }
  );

  // ============================================
  // PRICING RULES
  // ============================================

  // 12. CREATE PRICING RULE
  createPricingRule = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const rule = await this.eventService.createPricingRule(req.body);
      return ApiResponse.created(res, rule, "Pricing rule created");
    }
  );

  // 13. LIST PRICING RULES BY SESSION
  getPricingRules = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId } = req.params;
      const rules = await this.eventService.getPricingRulesBySession(sessionId);
      return ApiResponse.success(res, rules, "Pricing rules listed");
    }
  );

  // 14. UPDATE PRICING RULE
  updatePricingRule = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { ruleId } = req.params;
      const rule = await this.eventService.updatePricingRule(ruleId, req.body);
      return ApiResponse.success(res, rule, "Pricing rule updated");
    }
  );

  // 15. DELETE PRICING RULE
  deletePricingRule = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { ruleId } = req.params;
      await this.eventService.deletePricingRule(ruleId);
      return ApiResponse.success(res, null, "Pricing rule deleted");
    }
  );

  // ============================================
  // DYNAMIC PRICING (Strategy Pattern)
  // ============================================

  // 16. CALCULATE SINGLE PRICE (Includes rules)
  calculatePrice = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId, priceId } = req.params;
      const { userId, userAge, ticketQuantity } = req.query;

      const result = await this.eventService.calculatePrice(
        sessionId,
        priceId,
        {
          userId: userId as string,
          userAge: userAge ? parseInt(userAge as string) : undefined,
          ticketQuantity: ticketQuantity
            ? parseInt(ticketQuantity as string)
            : 1,
        }
      );

      return ApiResponse.success(res, result, "Price calculated");
    }
  );

  // 17. CALCULATE ALL PRICES FOR A SESSION
  calculateSessionPrices = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId } = req.params;
      const result = await this.eventService.calculateSessionPrices(sessionId);
      return ApiResponse.success(res, result, "Prices calculated");
    }
  );
}

import { Request, Response } from "express";
import { asyncHandlerWithThis } from "../../common/middleware/async-handler";
import { ApiResponse } from "../../common/responses/api-response";
import { EventService } from "./services/event.services";

export class EventController {
  constructor(private eventService: EventService) {}

  createEvent = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const event = await this.eventService.createEvent(req.body);
      return ApiResponse.created(res, event, "Event created successfully");
    }
  );

  createSession = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const session = await this.eventService.createSession(req.body);
      return ApiResponse.created(res, session, "Session created successfully");
    }
  );

  addPrices = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const prices = await this.eventService.addPricesToSession(req.body);
      return ApiResponse.created(res, prices, "Prices added successfully");
    }
  );

  getEvents = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const events = await this.eventService.getEvents();
      return ApiResponse.success(res, events, "Events listed successfully");
    }
  );

  getSessionDetails = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId } = req.params;
      const session = await this.eventService.getSessionDetails(sessionId);
      return ApiResponse.success(res, session, "Session details retrieved");
    }
  );

  getEventById = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { eventId } = req.params;
      const event = await this.eventService.getEventById(eventId);
      return ApiResponse.success(res, event, "Event details retrieved");
    }
  );

  updateEvent = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { eventId } = req.params;
      const event = await this.eventService.updateEvent(eventId, req.body);
      return ApiResponse.success(res, event, "Event updated");
    }
  );

  deleteEvent = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { eventId } = req.params;
      await this.eventService.deleteEvent(eventId);
      return ApiResponse.success(res, null, "Event deleted");
    }
  );

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

  deleteSession = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId } = req.params;
      await this.eventService.deleteSession(sessionId);
      return ApiResponse.success(res, null, "Session deleted");
    }
  );

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

  createPricingRule = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const rule = await this.eventService.createPricingRule(req.body);
      return ApiResponse.created(res, rule, "Pricing rule created");
    }
  );

  getPricingRules = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId } = req.params;
      const rules = await this.eventService.getPricingRulesBySession(sessionId);
      return ApiResponse.success(res, rules, "Pricing rules listed");
    }
  );

  updatePricingRule = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { ruleId } = req.params;
      const rule = await this.eventService.updatePricingRule(ruleId, req.body);
      return ApiResponse.success(res, rule, "Pricing rule updated");
    }
  );

  deletePricingRule = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { ruleId } = req.params;
      await this.eventService.deletePricingRule(ruleId);
      return ApiResponse.success(res, null, "Pricing rule deleted");
    }
  );

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

  calculateSessionPrices = asyncHandlerWithThis(
    this,
    async (req: Request, res: Response) => {
      const { sessionId } = req.params;
      const result = await this.eventService.calculateSessionPrices(sessionId);
      return ApiResponse.success(res, result, "Prices calculated");
    }
  );
}

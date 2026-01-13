import { TicketController } from "./ticket.controller";
import { LockService } from "../../common/lock.service";
import { TicketRepository } from "./ticket.repository";
import { BookingRepository } from "../booking/booking.repository";
import { TicketService } from "./ticket.services";

export class TicketModule {
  static getController(): TicketController {
    const ticketRepo = new TicketRepository();
    const bookingRepo = new BookingRepository();
    const lockService = new LockService();
    const ticketService = new TicketService(
      ticketRepo,
      bookingRepo,
      lockService
    );

    return new TicketController(ticketService);
  }
}

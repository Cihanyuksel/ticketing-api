import { Request, Response } from "express";
import logger from "../utils/logger";
import { TicketService } from "../services/ticket-services";

export class TicketController {
  constructor(private ticketService: TicketService) {}

  /**
   * POST /api/tickets/lock
   */
  lockSeat = async (req: Request, res: Response) => {
    try {
      const { eventId, seatId, userId } = req.body;

      if (!eventId || !seatId || !userId) {
        return res
          .status(400)
          .json({ message: "Eksik bilgi! eventId, seatId ve userId gerekli." });
      }

      const isLocked = await this.ticketService.lockSeat(
        eventId,
        seatId,
        userId
      );

      if (isLocked) {
        return res
          .status(200)
          .json({ message: "Koltuk başarıyla kilitlendi. 10 dakikanız var!" });
      } else {
        return res.status(409).json({
          message:
            "Koltuk şu an müsait değil veya başkası tarafından kilitlenmiş.",
        });
      }
    } catch (error) {
      logger.error("Lock Hatası:", error);
      return res.status(500).json({ message: "Sunucu hatası." });
    }
  };

  /**
   * POST /api/tickets/purchase
   */
  purchaseTicket = async (req: Request, res: Response) => {
    try {
      const { eventId, seatId, userId } = req.body;

      const ticket = await this.ticketService.purchaseTicket(
        eventId,
        seatId,
        userId
      );

      return res.status(201).json({
        message: "Satın alma başarılı!",
        ticket: {
          pnr: ticket.referenceCode,
          price: ticket.price,
          status: ticket.status,
          seatId: ticket.seat.id,
        },
      });
    } catch (error: any) {
      logger.error("Satın Alma Hatası:", error);

      if (error.message.includes("rezervasyon süreniz dolmuş")) {
        return res.status(400).json({ message: error.message });
      }

      return res
        .status(500)
        .json({ message: "İşlem sırasında bir hata oluştu." });
    }
  };
}

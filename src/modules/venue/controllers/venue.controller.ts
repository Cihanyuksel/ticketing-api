import { Request, Response } from "express";
import { VenueManagerService } from "../services/venue-manager.service";
import { ApiResponse } from "../../../common/responses/api-response";
import { asyncHandler } from "../../../common/middleware/async-handler";
import { NotFoundError } from "../../../common/errors/app.error";

export class VenueController {
  constructor(private venueService: VenueManagerService) {}

  // ============================================
  // VENUE MANAGEMENT
  // ============================================
  createVenue = asyncHandler(async (req: Request, res: Response) => {
    const venue = await this.venueService.createVenue(req.body);
    return ApiResponse.created(
      res,
      venue,
      "Mekan başarıyla oluşturuldu. Şimdi bölümleri ekleyebilirsiniz."
    );
  });

  updateVenue = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const venue = await this.venueService.updateVenue(id, req.body);

    if (!venue) {
      throw new NotFoundError("Mekan", id);
    }

    return ApiResponse.success(res, venue, "Mekan güncellendi.");
  });

  getVenue = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const venue = await this.venueService.getVenueFullDetails(id);

    if (!venue) {
      throw new NotFoundError("Mekan", id);
    }

    return ApiResponse.success(res, venue);
  });

  listVenues = asyncHandler(async (req: Request, res: Response) => {
    const venues = await this.venueService.getAllVenues();
    return ApiResponse.success(res, venues);
  });

  // ============================================
  // SECTION MANAGEMENT
  // ============================================
  addSection = asyncHandler(async (req: Request, res: Response) => {
    const { venueId } = req.params;
    const section = await this.venueService.addSection(venueId, req.body);

    return ApiResponse.created(res, section, "Bölüm başarıyla eklendi.");
  });

  updateSection = asyncHandler(async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const section = await this.venueService.updateSection(sectionId, req.body);

    if (!section) {
      throw new NotFoundError("Bölüm", sectionId);
    }

    return ApiResponse.success(res, section, "Bölüm güncellendi.");
  });

  deleteSection = asyncHandler(async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const deleted = await this.venueService.deleteSection(sectionId);

    if (!deleted) {
      throw new NotFoundError("Bölüm", sectionId);
    }

    return ApiResponse.noContent(res);
  });

  getVenueSections = asyncHandler(async (req: Request, res: Response) => {
    const { venueId } = req.params;
    const sections = await this.venueService.getVenueSections(venueId);

    return ApiResponse.success(res, sections);
  });

  // ============================================
  // ROW MANAGEMENT
  // ============================================
  addRow = asyncHandler(async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const row = await this.venueService.addRow(sectionId, req.body);

    return ApiResponse.created(
      res,
      row,
      `Sıra eklendi: ${row.rowLabel} (${row.seats?.length || 0} koltuk)`
    );
  });

  deleteRow = asyncHandler(async (req: Request, res: Response) => {
    const { rowId } = req.params;
    const deleted = await this.venueService.deleteRow(rowId);

    if (!deleted) {
      throw new NotFoundError("Sıra", rowId);
    }

    return ApiResponse.noContent(res);
  });

  addBulkRows = asyncHandler(async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const result = await this.venueService.addBulkRows(sectionId, req.body);

    return ApiResponse.created(
      res,
      result,
      `${result.createdRows} sıra ve ${result.totalSeats} koltuk eklendi.`
    );
  });

  // ============================================
  // SEAT MANAGEMENT
  // ============================================
  addSeat = asyncHandler(async (req: Request, res: Response) => {
    const { rowId } = req.params;
    const seat = await this.venueService.addSeat(rowId, req.body);

    return ApiResponse.created(res, seat, "Koltuk eklendi.");
  });

  addBulkSeats = asyncHandler(async (req: Request, res: Response) => {
    const { rowId } = req.params;
    const seats = await this.venueService.addBulkSeats(rowId, req.body);

    return ApiResponse.created(res, seats, `${seats.length} koltuk eklendi.`);
  });

  updateSeat = asyncHandler(async (req: Request, res: Response) => {
    const { seatId } = req.params;
    const seat = await this.venueService.updateSeat(seatId, req.body);

    if (!seat) {
      throw new NotFoundError("Koltuk", seatId);
    }

    return ApiResponse.success(res, seat, "Koltuk güncellendi.");
  });

  deleteSeat = asyncHandler(async (req: Request, res: Response) => {
    const { seatId } = req.params;
    const deleted = await this.venueService.deleteSeat(seatId);

    if (!deleted) {
      throw new NotFoundError("Koltuk", seatId);
    }

    return ApiResponse.noContent(res);
  });

  getRowSeats = asyncHandler(async (req: Request, res: Response) => {
    const { rowId } = req.params;
    const seats = await this.venueService.getRowSeats(rowId);

    return ApiResponse.success(res, seats);
  });
}

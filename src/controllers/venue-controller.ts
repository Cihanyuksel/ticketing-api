import { Request, Response } from "express";
import { VenueAggregateService } from "../services/venue/venue-aggregate-service";

export class VenueController {
  constructor(private venueService: VenueAggregateService) {}

  // ============================================
  // VENUE MANAGEMENT
  // ============================================

  /**
   * POST /api/venues
   * Just record the location information
   */
  createVenue = async (req: Request, res: Response) => {
    try {
      const { name, city, district, address, imageUrl, googleMapsLink } =
        req.body;

      if (!name || !city || !district || !address) {
        return res.status(400).json({
          message: "Mekan adı, şehir, ilçe ve adres zorunludur.",
        });
      }

      const newVenue = await this.venueService.createVenue({
        name,
        city,
        district,
        address,
        imageUrl,
        googleMapsLink,
      });

      return res.status(201).json({
        message:
          "Mekan başarıyla oluşturuldu. Şimdi bölümleri ekleyebilirsiniz.",
        venue: newVenue,
      });
    } catch (error) {
      return res.status(500).json({ message: "Mekan oluşturulamadı.", error });
    }
  };

  /**
   * PATCH /api/venues/:id
   * Update location information
   */
  updateVenue = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await this.venueService.updateVenue(id, updates);

      if (!updated) {
        return res.status(404).json({ message: "Mekan bulunamadı." });
      }

      return res.json({
        message: "Mekan güncellendi.",
        venue: updated,
      });
    } catch (error) {
      return res.status(500).json({ message: "Güncelleme hatası", error });
    }
  };

  /**
   * GET /api/venues/:id
   * Get the venue details.
   */
  getVenue = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const venue = await this.venueService.getVenueFullDetails(id);

      if (!venue) {
        return res.status(404).json({ message: "Mekan bulunamadı." });
      }

      return res.json(venue);
    } catch (error) {
      return res.status(500).json({ message: "Sunucu hatası" });
    }
  };

  /**
   * GET /api/venues
   * List all venues
   */
  listVenues = async (req: Request, res: Response) => {
    try {
      const venues = await this.venueService.getAllVenues();
      return res.json(venues);
    } catch (error) {
      return res.status(500).json({ message: "Listeleme hatası" });
    }
  };

  // ============================================
  // SECTION MANAGEMENT
  // ============================================

  /**
   * POST /api/venues/:venueId/sections
   * Add a new section to the venue
   */
  addSection = async (req: Request, res: Response) => {
    try {
      const { venueId } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Bölüm adı zorunludur." });
      }

      const section = await this.venueService.addSection(venueId, { name });

      return res.status(201).json({
        message: "Bölüm başarıyla eklendi.",
        section,
      });
    } catch (error: any) {
      if (error.message === "Mekan bulunamadı") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Bölüm eklenemedi.", error });
    }
  };

  /**
   * PATCH /api/sections/:sectionId
   * Update the section
   */
  updateSection = async (req: Request, res: Response) => {
    try {
      const { sectionId } = req.params;
      const { name } = req.body;

      const updated = await this.venueService.updateSection(sectionId, {
        name,
      });

      if (!updated) {
        return res.status(404).json({ message: "Bölüm bulunamadı." });
      }

      return res.json({
        message: "Bölüm güncellendi.",
        section: updated,
      });
    } catch (error) {
      return res.status(500).json({ message: "Güncelleme hatası", error });
    }
  };

  /**
   * DELETE /api/sections/:sectionId
   * Delete the section
   */
  deleteSection = async (req: Request, res: Response) => {
    try {
      const { sectionId } = req.params;
      const deleted = await this.venueService.deleteSection(sectionId);

      if (!deleted) {
        return res.status(404).json({ message: "Bölüm bulunamadı." });
      }

      return res.json({ message: "Bölüm silindi." });
    } catch (error) {
      return res.status(500).json({ message: "Silme hatası", error });
    }
  };

  /**
   * GET /api/venues/:venueId/sections
   * List the sections of the venue
   */
  getVenueSections = async (req: Request, res: Response) => {
    try {
      const { venueId } = req.params;
      const sections = await this.venueService.getVenueSections(venueId);

      return res.json(sections);
    } catch (error) {
      return res.status(500).json({ message: "Listeleme hatası", error });
    }
  };

  // ============================================
  // ROW MANAGEMENT
  // ============================================

  /**
   * POST /api/sections/:sectionId/rows
   * Add a new row to the section (using automatic seat generation)
   */
  addRow = async (req: Request, res: Response) => {
    try {
      const { sectionId } = req.params;
      const { rowLabel, seatCount } = req.body;

      if (!rowLabel || !seatCount || seatCount < 1) {
        return res.status(400).json({
          message: "Sıra etiketi ve geçerli koltuk sayısı zorunludur.",
        });
      }

      const row = await this.venueService.addRow(sectionId, {
        rowLabel,
        seatCount,
      });

      return res.status(201).json({
        message: `Sıra eklendi: ${rowLabel} (${seatCount} koltuk)`,
        row,
      });
    } catch (error: any) {
      if (error.message === "Bölüm bulunamadı") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Sıra eklenemedi.", error });
    }
  };

  /**
   * DELETE /api/rows/:rowId
   * Delete row
   */
  deleteRow = async (req: Request, res: Response) => {
    try {
      const { rowId } = req.params;
      const deleted = await this.venueService.deleteRow(rowId);

      if (!deleted) {
        return res.status(404).json({ message: "Sıra bulunamadı." });
      }

      return res.json({ message: "Sıra silindi." });
    } catch (error) {
      return res.status(500).json({ message: "Silme hatası", error });
    }
  };

  /**
   * POST /api/sections/:sectionId/rows/bulk
   * Add bulk row to the section
   */
  addBulkRows = async (req: Request, res: Response) => {
    try {
      const { sectionId } = req.params;
      const { rowPrefix, startRow, endRow, seatsPerRow } = req.body;

      if (!rowPrefix || !startRow || !endRow || !seatsPerRow) {
        return res.status(400).json({
          message:
            "rowPrefix, startRow, endRow ve seatsPerRow alanları zorunludur.",
        });
      }

      if (startRow > endRow) {
        return res.status(400).json({
          message: "startRow, endRow'dan küçük veya eşit olmalıdır.",
        });
      }

      const result = await this.venueService.addBulkRows(sectionId, {
        rowPrefix,
        startRow,
        endRow,
        seatsPerRow,
      });

      return res.status(201).json({
        message: `${result.createdRows} sıra ve ${result.totalSeats} koltuk eklendi.`,
        ...result,
      });
    } catch (error: any) {
      if (error.message === "Bölüm bulunamadı") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Toplu sıra eklenemedi.", error });
    }
  };

  // ============================================
  // SEAT MANAGEMENT
  // ============================================

  /**
   * POST /api/rows/:rowId/seats
   * Add one seat to the row
   */
  addSeat = async (req: Request, res: Response) => {
    try {
      const { rowId } = req.params;
      const { seatNumber } = req.body;

      if (!seatNumber) {
        return res.status(400).json({ message: "Koltuk numarası zorunludur." });
      }

      const seat = await this.venueService.addSeat(rowId, { seatNumber });

      return res.status(201).json({
        message: "Koltuk eklendi.",
        seat,
      });
    } catch (error: any) {
      if (error.message === "Sıra bulunamadı") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Koltuk eklenemedi.", error });
    }
  };

  /**
   * POST /api/rows/:rowId/seats/bulk
   * Add multiple seats to the row
   */
  addBulkSeats = async (req: Request, res: Response) => {
    try {
      const { rowId } = req.params;
      const { startNumber, endNumber, prefix } = req.body;

      if (!startNumber || !endNumber || startNumber > endNumber) {
        return res.status(400).json({
          message: "Geçerli başlangıç ve bitiş numaraları gerekli.",
        });
      }

      const seats = await this.venueService.addBulkSeats(rowId, {
        startNumber,
        endNumber,
        prefix,
      });

      return res.status(201).json({
        message: `${seats.length} koltuk eklendi.`,
        seats,
      });
    } catch (error: any) {
      if (error.message === "Sıra bulunamadı") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Koltuklar eklenemedi.", error });
    }
  };

  /**
   * PATCH /api/seats/:seatId
   * Update seat
   */
  updateSeat = async (req: Request, res: Response) => {
    try {
      const { seatId } = req.params;
      const { seatNumber } = req.body;

      const updated = await this.venueService.updateSeat(seatId, {
        seatNumber,
      });

      if (!updated) {
        return res.status(404).json({ message: "Koltuk bulunamadı." });
      }

      return res.json({
        message: "Koltuk güncellendi.",
        seat: updated,
      });
    } catch (error) {
      return res.status(500).json({ message: "Güncelleme hatası", error });
    }
  };

  /**
   * DELETE /api/seats/:seatId
   * Delete seat
   */
  deleteSeat = async (req: Request, res: Response) => {
    try {
      const { seatId } = req.params;
      const deleted = await this.venueService.deleteSeat(seatId);

      if (!deleted) {
        return res.status(404).json({ message: "Koltuk bulunamadı." });
      }

      return res.json({ message: "Koltuk silindi." });
    } catch (error) {
      return res.status(500).json({ message: "Silme hatası", error });
    }
  };

  /**
   * GET /api/rows/:rowId/seats
   * List all the seats in the row
   */
  getRowSeats = async (req: Request, res: Response) => {
    try {
      const { rowId } = req.params;
      const seats = await this.venueService.getRowSeats(rowId);

      return res.json(seats);
    } catch (error) {
      return res.status(500).json({ message: "Listeleme hatası", error });
    }
  };
}

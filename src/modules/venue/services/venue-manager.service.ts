import { AppDataSource } from "../../../config/db";
import { Row } from "../entities/row.entity";
import { Seat } from "../entities/seat.entity";
import { Section } from "../entities/section.entity";
import { Venue } from "../entities/venue.entity";
import logger from "../../../utils/logger";
import { NotFoundError } from "../../../common/errors/app.error";
import { IVenueCacheService, IVenueCapacityService } from "../venue.interface";
import { Repository } from "typeorm";

export class VenueManagerService {

  constructor(
    private readonly venueRepository: Repository<Venue>,
    private readonly sectionRepository: Repository<Section>,
    private readonly rowRepository: Repository<Row>,
    private readonly seatRepository: Repository<Seat>,

    private readonly cacheService: IVenueCacheService,
    private readonly capacityService: IVenueCapacityService
  ) {}

  // ============================================
  // 1. VENUE MANAGEMENT
  // ============================================
  async createVenue(venueData: {
    name: string;
    city: string;
    district: string;
    address: string;
    imageUrl?: string;
    googleMapsLink?: string;
  }): Promise<Venue> {
    try {
      const venue = this.venueRepository.create({
        ...venueData,
        totalCapacity: 0,
      });

      const savedVenue = await this.venueRepository.save(venue);
      logger.info(`🏟️ Yeni mekan oluşturuldu: ${savedVenue.name}`);

      return savedVenue;
    } catch (error) {
      logger.error("Mekan oluşturulurken hata:", error);
      throw error;
    }
  }

  async updateVenue(
    venueId: string,
    updates: Partial<Venue>
  ): Promise<Venue | null> {
    const venue = await this.venueRepository.findOneBy({ id: venueId });
    if (!venue) return null;

    Object.assign(venue, updates);
    const updated = await this.venueRepository.save(venue);

    await this.cacheService.clearVenueCache(venueId);
    return updated;
  }

  async getVenueFullDetails(venueId: string): Promise<Venue | null> {
    const cachedVenue = await this.cacheService.getCachedVenueDetails(venueId);
    if (cachedVenue) {
      return cachedVenue;
    }

    const venue = await this.venueRepository.findOne({
      where: { id: venueId },
      relations: {
        sections: {
          rows: {
            seats: true,
          },
        },
      },
    });

    if (venue) {
      await this.cacheService.cacheVenueDetails(venueId, venue);
    }

    return venue;
  }

  async getAllVenues(): Promise<Venue[]> {
    return await this.venueRepository.find({
      select: {
        id: true,
        name: true,
        city: true,
        imageUrl: true,
        totalCapacity: true,
      },
    });
  }

  async getVenueSections(venueId: string): Promise<Section[]> {
    return await this.sectionRepository.find({
      where: { venue: { id: venueId } },
      select: {
        id: true,
        name: true,
        capacity: true,
      },
    });
  }

  // ============================================
  // 2. SECTION MANAGEMENT
  // ============================================
  async addSection(
    venueId: string,
    sectionData: { name: string }
  ): Promise<Section> {
    const venue = await this.venueRepository.findOneBy({ id: venueId });
    if (!venue) {
      throw new NotFoundError("Mekan", venueId);
    }

    const section = this.sectionRepository.create({
      name: sectionData.name,
      capacity: 0,
      venue: venue,
    });

    const saved = await this.sectionRepository.save(section);
    await this.cacheService.clearVenueCache(venueId);

    logger.info(`📍 Bölüm eklendi: ${saved.name} -> ${venue.name}`);
    return saved;
  }

  async updateSection(
    sectionId: string,
    updates: { name?: string }
  ): Promise<Section | null> {
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
      relations: ["venue"],
    });

    if (!section) return null;

    Object.assign(section, updates);
    const updated = await this.sectionRepository.save(section);

    await this.cacheService.clearVenueCache(section.venue.id);
    return updated;
  }

  async deleteSection(sectionId: string): Promise<boolean> {
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
      relations: ["venue"],
    });

    if (!section) return false;

    const venueId = section.venue.id;
    await this.sectionRepository.remove(section);

    await this.capacityService.recalculateVenueCapacity(venueId);
    await this.cacheService.clearVenueCache(venueId);

    return true;
  }

  // ============================================
  // 3. ROW MANAGEMENT
  // ============================================
  async addRow(
    sectionId: string,
    rowData: { rowLabel: string; seatCount: number }
  ): Promise<Row> {
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
      relations: ["venue"],
    });

    if (!section) {
      throw new NotFoundError("Bölüm", sectionId);
    }

    const row = this.rowRepository.create({
      rowLabel: rowData.rowLabel,
      section: section,
    });

    const savedRow = await this.rowRepository.save(row);

    const seatValues = [];
    for (let i = 1; i <= rowData.seatCount; i++) {
      seatValues.push({
        seatNumber: `${rowData.rowLabel}-${i}`,
        rowId: savedRow.id,
      });
    }

    await this.seatRepository
      .createQueryBuilder()
      .insert()
      .into(Seat)
      .values(seatValues)
      .execute();

    const rowWithSeats = await this.rowRepository.findOne({
      where: { id: savedRow.id },
      relations: ["seats"],
    });

    await this.capacityService.recalculateFromSection(
      sectionId,
      section.venue.id
    );
    await this.cacheService.clearVenueCache(section.venue.id);

    logger.info(
      `🪑 Sıra eklendi: ${rowData.rowLabel} (${rowData.seatCount} koltuk)`
    );

    return rowWithSeats!;
  }

  async deleteRow(rowId: string): Promise<boolean> {
    const row = await this.rowRepository.findOne({
      where: { id: rowId },
      relations: ["section", "section.venue"],
    });

    if (!row) return false;

    const sectionId = row.section.id;
    const venueId = row.section.venue.id;

    await this.rowRepository.remove(row);

    await this.capacityService.recalculateFromSection(sectionId, venueId);
    await this.cacheService.clearVenueCache(venueId);

    return true;
  }

  async addBulkRows(
    sectionId: string,
    bulkData: {
      rowPrefix: string;
      startRow: number;
      endRow: number;
      seatsPerRow: number;
    }
  ): Promise<{ createdRows: number; totalSeats: number }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const section = await queryRunner.manager.findOne(Section, {
        where: { id: sectionId },
        relations: ["venue"],
      });

      if (!section) {
        throw new NotFoundError("Bölüm", sectionId);
      }

      const rowsToInsert: Partial<Row>[] = [];
      for (
        let rowNum = bulkData.startRow;
        rowNum <= bulkData.endRow;
        rowNum++
      ) {
        rowsToInsert.push({
          rowLabel: `${bulkData.rowPrefix}${rowNum}`,
          section: section,
        });
      }

      const savedRows = await queryRunner.manager.save(Row, rowsToInsert);

      const seatsToInsert: any[] = [];
      let totalSeatsCreated = 0;

      for (const row of savedRows) {
        for (let seatNum = 1; seatNum <= bulkData.seatsPerRow; seatNum++) {
          seatsToInsert.push({
            seatNumber: `${row.rowLabel}-${seatNum}`,
            rowId: row.id,
          });
          totalSeatsCreated++;
        }
      }

      const chunkSize = 1000;
      for (let i = 0; i < seatsToInsert.length; i += chunkSize) {
        const chunk = seatsToInsert.slice(i, i + chunkSize);
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(Seat)
          .values(chunk)
          .execute();
      }

      section.capacity += totalSeatsCreated;
      await queryRunner.manager.save(section);

      if (section.venue) {
        section.venue.totalCapacity += totalSeatsCreated;
        await queryRunner.manager.save(section.venue);
      }

      await queryRunner.commitTransaction();

      await this.cacheService.clearVenueCache(section.venue.id);

      logger.info(
        `🪑 Toplu işlem tamam: ${savedRows.length} sıra, ${totalSeatsCreated} koltuk eklendi.`
      );

      return {
        createdRows: savedRows.length,
        totalSeats: totalSeatsCreated,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error("Toplu sıra eklenirken hata:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ============================================
  // 4. SEAT MANAGEMENT
  // ============================================
  async addSeat(
    rowId: string,
    seatData: { seatNumber: string }
  ): Promise<Seat> {
    const row = await this.rowRepository.findOne({
      where: { id: rowId },
      relations: ["section", "section.venue"],
    });

    if (!row) {
      throw new NotFoundError("Sıra", rowId);
    }

    const result = await this.seatRepository
      .createQueryBuilder()
      .insert()
      .into(Seat)
      .values({
        seatNumber: seatData.seatNumber,
        rowId: row.id,
      })
      .execute();

    const seatId = result.identifiers[0].id;
    const saved = await this.seatRepository.findOne({
      where: { id: seatId },
    });

    await this.capacityService.recalculateFromSection(
      row.section.id,
      row.section.venue.id
    );
    await this.cacheService.clearVenueCache(row.section.venue.id);

    logger.info(`🪑 Koltuk eklendi: ${seatData.seatNumber}`);
    return saved!;
  }

  async addBulkSeats(
    rowId: string,
    bulkData: { startNumber: number; endNumber: number; prefix?: string }
  ): Promise<Seat[]> {
    const row = await this.rowRepository.findOne({
      where: { id: rowId },
      relations: ["section", "section.venue"],
    });

    if (!row) {
      throw new NotFoundError("Sıra", rowId);
    }

    const prefix = bulkData.prefix || row.rowLabel;
    const seatValues = [];

    for (let i = bulkData.startNumber; i <= bulkData.endNumber; i++) {
      seatValues.push({
        seatNumber: `${prefix}-${i}`,
        rowId: row.id,
      });
    }

    await this.seatRepository
      .createQueryBuilder()
      .insert()
      .into(Seat)
      .values(seatValues)
      .execute();

    const savedSeats = await this.seatRepository.find({
      where: { row: { id: rowId } },
      order: { seatNumber: "ASC" },
    });

    await this.capacityService.recalculateFromSection(
      row.section.id,
      row.section.venue.id
    );
    await this.cacheService.clearVenueCache(row.section.venue.id);

    logger.info(
      `🪑 Toplu koltuk eklendi: ${seatValues.length} koltuk (${prefix})`
    );
    return savedSeats;
  }

  async updateSeat(
    seatId: string,
    updates: { seatNumber?: string }
  ): Promise<Seat | null> {
    const seat = await this.seatRepository.findOne({
      where: { id: seatId },
      relations: ["row", "row.section", "row.section.venue"],
    });

    if (!seat) return null;

    Object.assign(seat, updates);
    const updated = await this.seatRepository.save(seat);

    await this.cacheService.clearVenueCache(seat.row.section.venue.id);
    return updated;
  }

  async deleteSeat(seatId: string): Promise<boolean> {
    const seat = await this.seatRepository.findOne({
      where: { id: seatId },
      relations: ["row", "row.section", "row.section.venue"],
    });

    if (!seat) return false;

    const sectionId = seat.row.section.id;
    const venueId = seat.row.section.venue.id;

    await this.seatRepository.remove(seat);

    await this.capacityService.recalculateFromSection(sectionId, venueId);
    await this.cacheService.clearVenueCache(venueId);

    return true;
  }

  async getRowSeats(rowId: string): Promise<Seat[]> {
    return await this.seatRepository.find({
      where: { row: { id: rowId } },
      order: { seatNumber: "ASC" },
    });
  }
}

import { Row } from "../entities/row.entity";
import { Seat } from "../entities/seat.entity";
import { Section } from "../entities/section.entity";
import { Venue } from "../entities/venue.entity";

export interface IVenueRepository {
  findById(id: string): Promise<Venue | null>;
  findByIdWithRelations(id: string): Promise<Venue | null>;
  findAll(): Promise<Venue[]>;
  create(data: Partial<Venue>): Venue;
  save(venue: Venue): Promise<Venue>;
  update(id: string, data: Partial<Venue>): Promise<Venue>;
}

export interface ISectionRepository {
  findById(id: string): Promise<Section | null>;
  findByIdWithVenue(id: string): Promise<Section | null>;
  findByVenueId(venueId: string): Promise<Section[]>;
  create(data: Partial<Section>): Section;
  save(section: Section): Promise<Section>;
  update(id: string, data: Partial<Section>): Promise<Section>;
  remove(section: Section): Promise<void>;
}

export interface IRowRepository {
  findById(id: string): Promise<Row | null>;
  findByIdWithSeats(id: string): Promise<Row | null>;
  findByIdWithRelations(id: string): Promise<Row | null>;
  findBySectionId(sectionId: string): Promise<Row[]>;
  create(data: Partial<Row>): Row;
  save(row: Row): Promise<Row>;
  saveMany(rows: Row[]): Promise<Row[]>;
  remove(row: Row): Promise<void>;
}

export interface ISeatRepository {
  findById(id: string): Promise<Seat | null>;
  findByIdWithRelations(id: string): Promise<Seat | null>;
  findByRowId(rowId: string): Promise<Seat[]>;
  bulkInsert(seats: Partial<Seat>[]): Promise<void>;
  update(id: string, data: Partial<Seat>): Promise<Seat>;
  remove(seat: Seat): Promise<void>;
}

import { AppDataSource } from "../../../config/db";
import { Seat } from "../entities/seat.entity";
import { ISeatRepository } from "./venue.repository.interface";

export class TypeOrmSeatRepository implements ISeatRepository {
  private repo = AppDataSource.getRepository(Seat);

  async findById(id: string): Promise<Seat | null> {
    return this.repo.findOneBy({ id });
  }

  async findByIdWithRelations(id: string): Promise<Seat | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["row", "row.section", "row.section.venue"],
    });
  }

  async findByRowId(rowId: string): Promise<Seat[]> {
    return this.repo.find({
      where: { row: { id: rowId } },
      order: { seatNumber: "ASC" },
    });
  }

  async bulkInsert(seats: Partial<Seat>[]): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(Seat)
      .values(seats)
      .execute();
  }

  async update(id: string, data: Partial<Seat>): Promise<Seat> {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Seat with id ${id} not found after update`);
    }
    return updated;
  }

  async remove(seat: Seat): Promise<void> {
    await this.repo.remove(seat);
  }
}

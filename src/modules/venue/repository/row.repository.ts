import { AppDataSource } from "../../../config/db";
import { Row } from "../entities/row.entity";
import { IRowRepository } from "./venue.repository.interface";

export class TypeOrmRowRepository implements IRowRepository {
  private repo = AppDataSource.getRepository(Row);

  async findById(id: string): Promise<Row | null> {
    return this.repo.findOneBy({ id });
  }

  async findByIdWithSeats(id: string): Promise<Row | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["seats"],
    });
  }

  async findByIdWithRelations(id: string): Promise<Row | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["section", "section.venue"],
    });
  }

  async findBySectionId(sectionId: string): Promise<Row[]> {
    return this.repo.find({
      where: { section: { id: sectionId } },
    });
  }

  create(data: Partial<Row>): Row {
    return this.repo.create(data);
  }

  async save(row: Row): Promise<Row> {
    return this.repo.save(row);
  }

  async saveMany(rows: Row[]): Promise<Row[]> {
    return this.repo.save(rows);
  }

  async remove(row: Row): Promise<void> {
    await this.repo.remove(row);
  }
}

import { AppDataSource } from "../../../config/db";
import { Venue } from "../entities/venue.entity";
import { IVenueRepository } from "./venue.repository.interface";

export class TypeOrmVenueRepository implements IVenueRepository {
  private repo = AppDataSource.getRepository(Venue);

  async findById(id: string): Promise<Venue | null> {
    return this.repo.findOneBy({ id });
  }

  async findByIdWithRelations(id: string): Promise<Venue | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        sections: {
          rows: {
            seats: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<Venue[]> {
    return this.repo.find({
      select: {
        id: true,
        name: true,
        city: true,
        imageUrl: true,
        totalCapacity: true,
      },
    });
  }

  create(data: Partial<Venue>): Venue {
    return this.repo.create(data);
  }

  async save(venue: Venue): Promise<Venue> {
    return this.repo.save(venue);
  }

  async update(id: string, data: Partial<Venue>): Promise<Venue> {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Venue with id ${id} not found after update`);
    }
    return updated;
  }
}

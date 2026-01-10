import { AppDataSource } from "../../../config/db";
import { Section } from "../entities/section.entity";
import { ISectionRepository } from "./venue.repository.interface";

export class TypeOrmSectionRepository implements ISectionRepository {
  private repo = AppDataSource.getRepository(Section);

  async findById(id: string): Promise<Section | null> {
    return this.repo.findOneBy({ id });
  }

  async findByIdWithVenue(id: string): Promise<Section | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["venue"],
    });
  }

  async findByVenueId(venueId: string): Promise<Section[]> {
    return this.repo.find({
      where: { venue: { id: venueId } },
      select: {
        id: true,
        name: true,
        capacity: true,
      },
    });
  }

  create(data: Partial<Section>): Section {
    return this.repo.create(data);
  }

  async save(section: Section): Promise<Section> {
    return this.repo.save(section);
  }

  async update(id: string, data: Partial<Section>): Promise<Section> {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Section with id ${id} not found after update`);
    }
    return updated;
  }

  async remove(section: Section): Promise<void> {
    await this.repo.remove(section);
  }
}

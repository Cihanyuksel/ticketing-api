import { AppDataSource } from "../../config/db";
import { Row } from "../../entity/venue/Rows";
import { Section } from "../../entity/venue/Section";
import { Venue } from "../../entity/venue/Venue";
import logger from "../../utils/logger";

export class VenueCapacityService {
  private venueRepository = AppDataSource.getRepository(Venue);
  private sectionRepository = AppDataSource.getRepository(Section);
  private rowRepository = AppDataSource.getRepository(Row);

  async recalculateSectionCapacity(sectionId: string): Promise<number> {
    try {
      const rows = await this.rowRepository.find({
        where: { section: { id: sectionId } },
        relations: ["seats"],
      });

      const totalSeats = rows.reduce((sum, row) => {
        return sum + (row.seats?.length || 0);
      }, 0);

      await this.sectionRepository.update(sectionId, { capacity: totalSeats });

      logger.info(`📊 Section kapasitesi güncellendi: ${totalSeats} koltuk`);
      return totalSeats;
    } catch (error) {
      logger.error("Section kapasite hesaplama hatası:", error);
      throw error;
    }
  }

  async recalculateVenueCapacity(venueId: string): Promise<number> {
    try {
      const sections = await this.sectionRepository.find({
        where: { venue: { id: venueId } },
      });

      const totalCapacity = sections.reduce((sum, section) => {
        return sum + section.capacity;
      }, 0);

      await this.venueRepository.update(venueId, { totalCapacity });

      logger.info(`📊 Venue kapasitesi güncellendi: ${totalCapacity} koltuk`);
      return totalCapacity;
    } catch (error) {
      logger.error("Venue kapasite hesaplama hatası:", error);
      throw error;
    }
  }

  async recalculateFromSection(
    sectionId: string,
    venueId: string
  ): Promise<void> {
    await this.recalculateSectionCapacity(sectionId);
    await this.recalculateVenueCapacity(venueId);
  }

  async recalculateVenueCapacityDirect(venueId: string): Promise<number> {
    try {
      const sections = await this.sectionRepository
        .createQueryBuilder("section")
        .leftJoinAndSelect("section.rows", "row")
        .leftJoinAndSelect("row.seats", "seat")
        .where("section.venueId = :venueId", { venueId })
        .getMany();

      let totalCapacity = 0;

      for (const section of sections) {
        const sectionCapacity = section.rows.reduce((sum, row) => {
          return sum + (row.seats?.length || 0);
        }, 0);

        if (section.capacity !== sectionCapacity) {
          await this.sectionRepository.update(section.id, {
            capacity: sectionCapacity,
          });
        }

        totalCapacity += sectionCapacity;
      }

      await this.venueRepository.update(venueId, { totalCapacity });

      logger.info(
        `📊 Venue direkt kapasite güncellendi: ${totalCapacity} koltuk`
      );
      return totalCapacity;
    } catch (error) {
      logger.error("Venue direkt kapasite hesaplama hatası:", error);
      throw error;
    }
  }

  async incrementSectionCapacity(
    sectionId: string,
    amount: number
  ): Promise<void> {
    await this.sectionRepository.increment(
      { id: sectionId },
      "capacity",
      amount
    );
    logger.info(`📊 Section kapasitesi +${amount} arttırıldı`);
  }

  async decrementSectionCapacity(
    sectionId: string,
    amount: number
  ): Promise<void> {
    await this.sectionRepository.decrement(
      { id: sectionId },
      "capacity",
      amount
    );
    logger.info(`📊 Section kapasitesi -${amount} azaltıldı`);
  }

  async incrementVenueCapacity(venueId: string, amount: number): Promise<void> {
    await this.venueRepository.increment(
      { id: venueId },
      "totalCapacity",
      amount
    );
    logger.info(`📊 Venue kapasitesi +${amount} arttırıldı`);
  }

  async decrementVenueCapacity(venueId: string, amount: number): Promise<void> {
    await this.venueRepository.decrement(
      { id: venueId },
      "totalCapacity",
      amount
    );
    logger.info(`📊 Venue kapasitesi -${amount} azaltıldı`);
  }
}

import redisClient from "../config/redis";
import { AppDataSource } from "../config/db";
import { Ticket, TicketStatus } from "../entity/ticket/Ticket";
import { Seat } from "../entity/venue/Seat";
import { Event } from "../entity/event/Event";
import logger from "../utils/logger";
import { User } from "../entity/auth/User";

export class TicketService {
  private static LOCK_TTL_SECONDS = 600;

  async lockSeat(eventId: string, seatId: string, userId: string): Promise<boolean> {

    const lockKey = `lock:event:${eventId}:seat:${seatId}`;

    try {
      const result = await redisClient.set(lockKey, userId, {
        EX: TicketService.LOCK_TTL_SECONDS,
        NX: true,
      });

      if (result === "OK") {
        logger.info(`🔒 Koltuk kilitlendi! User: ${userId}, Seat: ${seatId}`);
        return true;
      } else {
        logger.warn(`⛔ Koltuk zaten kilitli! İsteyen: ${userId}`);
        return false;
      }
    } catch (error) {
      logger.error("Redis Lock Hatası:", error);
      return false;
    }
  }

  
  async validateLock(eventId: string, seatId: string, userId: string): Promise<boolean> {

    const lockKey = `lock:event:${eventId}:seat:${seatId}`;
    const lockedBy = await redisClient.get(lockKey);
    return lockedBy === userId;

  }

  async unlockSeat(eventId: string, seatId: string): Promise<void> {

    const lockKey = `lock:event:${eventId}:seat:${seatId}`;
    await redisClient.del(lockKey);
    logger.info(`🔓 Kilit manuel kaldırıldı: ${lockKey}`);
    
  }


  private generateReferenceCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async purchaseTicket(eventId: string, seatId: string, userId: string): Promise<Ticket> {

    const hasLock = await this.validateLock(eventId, seatId, userId);

    if (!hasLock) {
      throw new Error(
        "Koltuk rezervasyon süreniz dolmuş veya koltuk başkasına ait."
      );
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = await queryRunner.manager.findOneBy(Event, { id: eventId });
      const seat = await queryRunner.manager.findOneBy(Seat, { id: seatId });
      const user = await queryRunner.manager.findOneBy(User, { id: userId });

      if (!event || !seat || !user) {
        throw new Error("Etkinlik, Koltuk veya Kullanıcı bulunamadı.");
      }

      const existingTicket = await queryRunner.manager.findOne(Ticket, {
        where: { event: { id: eventId }, seat: { id: seatId } },
      });

      if (existingTicket && existingTicket.status === TicketStatus.PAID) {
        throw new Error("Kritik Hata: Bu koltuk zaten satılmış görünüyor!");
      }

      const newTicket = new Ticket();
      newTicket.event = event;
      newTicket.seat = seat;
      newTicket.user = user;
      newTicket.price = event.basePrice;
      newTicket.status = TicketStatus.PAID;
      newTicket.purchasedAt = new Date();
      newTicket.referenceCode = this.generateReferenceCode();

      await queryRunner.manager.save(newTicket);

      await queryRunner.commitTransaction();
      logger.info(`✅ Bilet başarıyla oluşturuldu! Ticket ID: ${newTicket.id}`);

      await this.unlockSeat(eventId, seatId);

      return newTicket;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      logger.error("Satın alma işlemi başarısız, rollback yapıldı.", err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

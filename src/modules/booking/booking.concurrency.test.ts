import request from "supertest";
import { AppDataSource } from "../../config/db";
import redisClient from "../../config/redis";
import app from "../../app";

jest.setTimeout(30000);

describe("Booking Race Condition Tests", () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    if (!redisClient.isOpen) await redisClient.connect();
    await redisClient.flushAll();
  });

  afterAll(async () => {
    if (redisClient.isOpen) await redisClient.disconnect();
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  });

  it("should allow only ONE request to succeed for the same seat", async () => {
    const validPayload = {
      sessionId: "24d77c70-6789-4926-8918-66a519b30bf3",
      priceId: "fd2af458-542f-4e9f-99e6-4d91c2bca4eb",
      seatId: "ce91e9f9-9369-44e2-8c8e-c7e288abeb9c",
      userId: "ee68ccf5-f28d-42ad-aabb-f0a017d7b649",
    };

    const numberOfRequests = 5;
    const requests = [];

    console.log(`SALDIRI BAŞLIYOR: 5 istek aynı anda gönderiliyor...`);

    for (let i = 0; i < numberOfRequests; i++) {
      const reqPromise = request(app).post("/api/bookings").send(validPayload);

      requests.push(reqPromise);
    }

    const responses = await Promise.all(requests);

    let successCount = 0;
    let failCount = 0;

    responses.forEach((res) => {
      if (res.status === 201) {
        successCount++;
        console.log(`✅ Başarılı (Booking Created): ID=${res.body.id}`);
      } else {
        failCount++;
        console.log(
          `❌ Başarısız (${res.status}): ${
            res.body.message || JSON.stringify(res.body)
          }`
        );
        expect([400, 409]).toContain(res.status);
      }
    });

    console.log(
      `📊 Sonuçlar -> Başarılı: ${successCount}, Başarısız: ${failCount}`
    );

    expect(successCount).toBe(1);
    expect(failCount).toBe(numberOfRequests - 1);
  });
});

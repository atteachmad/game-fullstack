import { createSeedDatabase } from "@/lib/mock-db/seed";
import type { Database, Repository } from "@/lib/mock-db/schema";

export { DEMO_USER_ID } from "@/lib/mock-db/seed";

/**
 * Data disimpan di globalThis agar tidak hilang saat hot-reload di mode dev.
 *
 * PENTING untuk Vercel: memori serverless tidak dibagi antar-instance dan
 * ikut hilang ketika instance berhenti. Data di sini bersifat sementara.
 * Untuk data permanen, ganti objek `repository` di bawah dengan
 * implementasi database asli (lihat README di Langkah 8).
 */
const globalForDb = globalThis as unknown as { __codequestDb?: Database };

function db(): Database {
  if (!globalForDb.__codequestDb) {
    globalForDb.__codequestDb = createSeedDatabase();
  }
  return globalForDb.__codequestDb;
}

/** Salinan dalam, supaya pemanggil tidak bisa mengubah data internal secara tidak sengaja. */
function copy<T>(value: T): T {
  return structuredClone(value);
}

const MAX_RECORDS = 200;

function newId(): string {
  return globalThis.crypto.randomUUID();
}

export const repository: Repository = {
  async getUser(id) {
    const user = db().users.find((item) => item.id === id);
    return user ? copy(user) : null;
  },

  async updateUser(id, patch) {
    const user = db().users.find((item) => item.id === id);
    if (!user) return null;
    Object.assign(user, patch, { updatedAt: new Date().toISOString() });
    return copy(user);
  },

  async resetUser(id) {
    const user = db().users.find((item) => item.id === id);
    if (!user) return null;
    user.xp = 0;
    user.completedMissionIds = [];
    user.unlockedBadgeIds = [];
    user.updatedAt = new Date().toISOString();
    return copy(user);
  },

  async listPayments(userId, limit = 10) {
    return copy(
      db()
        .payments.filter((item) => item.userId === userId)
        .slice(-limit)
        .reverse()
    );
  },

  async createPayment(input) {
    const record = { ...input, id: newId(), createdAt: new Date().toISOString() };
    const store = db();
    store.payments.push(record);
    if (store.payments.length > MAX_RECORDS) store.payments.shift();
    return copy(record);
  },

  async listCrmEvents(userId, channel, limit = 10) {
    return copy(
      db()
        .crmEvents.filter((item) => item.userId === userId && (!channel || item.channel === channel))
        .slice(-limit)
        .reverse()
    );
  },

  async createCrmEvent(input) {
    const record = { ...input, id: newId(), createdAt: new Date().toISOString() };
    const store = db();
    store.crmEvents.push(record);
    if (store.crmEvents.length > MAX_RECORDS) store.crmEvents.shift();
    return copy(record);
  },
};
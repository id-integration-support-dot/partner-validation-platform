import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq, ne } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "./db";
import { schema } from "@/db/schema";

// Dibuat sebagai factory function (bukan instance tunggal di top-level file)
// karena binding D1 dan env var Cloudflare cuma bisa diakses lewat
// request context — bukan saat module pertama kali di-load.
export async function getAuth() {
  const db = await getDb();
  const { env } = await getCloudflareContext({ async: true });

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),

    emailAndPassword: {
      enabled: true,
      // partner baru harus nunggu di-approve admin dulu sebelum bisa login
      autoSignIn: false,
    },

    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "partner", input: false },
        companyName: { type: "string", required: false },
        status: { type: "string", defaultValue: "pending", input: false },
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 hari
    },

    // --- Single Active Session ---
    // Setiap kali sesi baru berhasil dibuat (login baru), semua sesi LAIN
    // milik user yang sama langsung dihapus. Efeknya: device/browser lama
    // otomatis ter-logout begitu user login dari device baru.
    databaseHooks: {
      session: {
        create: {
          after: async (newSession) => {
            await db
              .delete(schema.session)
              .where(
                and(
                  eq(schema.session.userId, newSession.userId),
                  ne(schema.session.id, newSession.id),
                ),
              );
          },
        },
      },
    },
  });
}

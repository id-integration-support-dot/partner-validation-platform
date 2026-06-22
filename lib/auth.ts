import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq, ne } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "./db";
import { schema } from "@/db/schema";

export async function getAuth() {
  const db = await getDb();
  const { env } = await getCloudflareContext({ async: true });

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    // types/env.ts — tambahkan baris ini
RESEND_API_KEY: string;
    

    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),

    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      // Aktifkan forgot password
      sendResetPassword: async ({ user, url }) => {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Kalau sudah verifikasi domain di Resend, ganti dengan:
            // from: "noreply@sppintegration.com"
            from: "onboarding@resend.dev",
            to: user.email,
            subject: "Reset Password — Partner Integration Platform",
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h2 style="font-size: 18px; font-weight: 600; color: #111;">Reset Password</h2>
                <p style="color: #555; font-size: 14px; line-height: 1.6;">
                  Halo ${user.name},<br/><br/>
                  Kami menerima permintaan untuk mereset password akun Anda di
                  Partner Integration Platform.
                </p>
                <a
                  href="${url}"
                  style="display: inline-block; margin: 16px 0; padding: 10px 20px;
                         background: #111; color: #fff; text-decoration: none;
                         border-radius: 6px; font-size: 14px; font-weight: 500;"
                >
                  Reset Password
                </a>
                <p style="color: #999; font-size: 12px;">
                  Link ini berlaku selama 1 jam. Kalau Anda tidak meminta reset password,
                  abaikan email ini.
                </p>
              </div>
            `,
          }),
        });
      },
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

    // Single Active Session
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

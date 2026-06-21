import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { schema } from "@/db/schema";

// Dipanggil di setiap request (API route / server component) karena
// binding D1 cuma tersedia lewat Cloudflare request context, bukan
// variabel global biasa.
export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
}

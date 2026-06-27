import { and, eq } from "drizzle-orm";  
import { getDb } from "@/lib/auth/db";  
import { user } from "@/db/schema";  
  
export class UserRepository {  
  async findById(id: string) {  
    const db = await getDb();  
  
    const rows = await db  
      .select()  
      .from(user)  
      .where(eq(user.id, id))  
      .limit(1);  
  
    return rows[0] ?? null;  
  }  
  
  async findPartnerById(id: string) {  
    const db = await getDb();  
  
    const rows = await db  
      .select()  
      .from(user)  
      .where(eq(user.id, id))  
      .limit(1);  
  
    return rows[0] ?? null;  
  }  
  
  async findPendingPartners() {  
    const db = await getDb();  
  
    return await db  
      .select()  
      .from(user)  
      .where(and(eq(user.role, "partner"), eq(user.status, "pending")));  
  }  
  
  async findAllPartners() {  
    const db = await getDb();  
  
    return await db.select().from(user).where(eq(user.role, "partner"));  
  }  
  
  async updatePartnerBasicInfo(  
    userId: string,  
    payload: {  
      name: string;  
      email: string;  
      companyName: string | null;  
    }  
  ) {  
    const db = await getDb();  
  
    await db  
      .update(user)  
      .set({  
        name: payload.name,  
        email: payload.email,  
        companyName: payload.companyName,  
        updatedAt: new Date(),  
      })  
      .where(eq(user.id, userId));  
  }  
  
  async approvePartner(userId: string, adminId: string) {  
    const db = await getDb();  
  
    await db  
      .update(user)  
      .set({  
        status: "approved",  
        updatedAt: new Date(),  
      })  
      .where(eq(user.id, userId));  
  }  
  
  async rejectPartner(userId: string, adminId: string, reason: string) {  
    const db = await getDb();  
  
    await db  
      .update(user)  
      .set({  
        status: "rejected",  
        updatedAt: new Date(),  
      })  
      .where(eq(user.id, userId));  
  }  
}
import { asc, eq } from "drizzle-orm";  
import { getDb } from "@/lib/auth/db";  
import { services, subServices } from "@/db/schema";  
  
export class ServiceRepository {  
  async getAllServices() {  
    const db = await getDb();  
  
    const allServices = await db  
      .select()  
      .from(services)  
      .where(eq(services.active, true))  
      .orderBy(asc(services.orderIndex));  
  
    const allSubServices = await db  
      .select()  
      .from(subServices)  
      .where(eq(subServices.active, true))  
      .orderBy(asc(subServices.orderIndex));  
  
    return allServices.map((service) => ({  
      ...service,  
      subServices: allSubServices.filter(  
        (subService) => subService.serviceId === service.id  
      ),  
    }));  
  }  
  
  async getAllSubServices() {  
    const db = await getDb();  
  
    return await db  
      .select()  
      .from(subServices)  
      .where(eq(subServices.active, true))  
      .orderBy(asc(subServices.orderIndex));  
  }  
  
  async getSubServicesByIds(ids: string[]) {  
    const db = await getDb();  
  
    const all = await db  
      .select()  
      .from(subServices)  
      .where(eq(subServices.active, true));  
  
    return all.filter((item) => ids.includes(item.id));  
  }  
}  
  
export const serviceRepository = new ServiceRepository();
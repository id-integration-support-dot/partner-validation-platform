import { eq } from "drizzle-orm";  
import { getDb } from "@/lib/auth/db";  
import {  
  partnerScopes,  
  partnerProgress,  
  subServices,  
  services,  
} from "@/db/schema";  
  
function generateId() {  
  return crypto.randomUUID();  
}  
  
type ScopeData = {  
  sub_service_ids: string[];  
};  
  
export class ScopeService {  
  async setPartnerScope(partnerUserId: string, subServiceIds: string[]) {  
    const db = await getDb();  
  
    const existingSubServices = await db.select().from(subServices);  
    const validIds = new Set(existingSubServices.map((item) => item.id));  
  
    for (const id of subServiceIds) {  
      if (!validIds.has(id)) {  
        throw new Error(`Invalid sub_service_id: ${id}`);  
      }  
    }  
  
    const now = new Date();  
  
    const existingScope = await db  
      .select()  
      .from(partnerScopes)  
      .where(eq(partnerScopes.partnerUserId, partnerUserId))  
      .limit(1);  
  
    const scopeData: ScopeData = {  
      sub_service_ids: subServiceIds,  
    };  
  
    if (existingScope.length > 0) {  
      await db  
        .update(partnerScopes)  
        .set({  
          scopeData: JSON.stringify(scopeData),  
          activeCount: subServiceIds.length,  
          passedCount: 0,  
          progressPercentage: "0.00",  
          scopeSetAt: now,  
          updatedAt: now,  
        })  
        .where(eq(partnerScopes.partnerUserId, partnerUserId));  
    } else {  
      await db.insert(partnerScopes).values({  
        id: generateId(),  
        partnerUserId,  
        scopeData: JSON.stringify(scopeData),  
        activeCount: subServiceIds.length,  
        passedCount: 0,  
        progressPercentage: "0.00",  
        scopeSetAt: now,  
        createdAt: now,  
        updatedAt: now,  
      });  
    }  
  
    const existingProgressRows = await db  
      .select()  
      .from(partnerProgress)  
      .where(eq(partnerProgress.partnerUserId, partnerUserId));  
  
    const existingProgressSubServiceIds = new Set(  
      existingProgressRows.map((row) => row.subServiceId)  
    );  
  
    for (const subServiceId of subServiceIds) {  
      if (!existingProgressSubServiceIds.has(subServiceId)) {  
        await db.insert(partnerProgress).values({  
          id: generateId(),  
          partnerUserId,  
          subServiceId,  
          trackAStatus: "pending",  
          trackBStatus: "pending",  
          overallStatus: "pending",  
          createdAt: now,  
          updatedAt: now,  
        });  
      }  
    }  
  
    return await this.getPartnerScope(partnerUserId);  
  }  
  
  async getPartnerScope(partnerUserId: string) {  
    const db = await getDb();  
  
    const scopeRows = await db  
      .select()  
      .from(partnerScopes)  
      .where(eq(partnerScopes.partnerUserId, partnerUserId))  
      .limit(1);  
  
    if (scopeRows.length === 0) {  
      return null;  
    }  
  
    const scope = scopeRows[0];  
    const parsedScopeData = JSON.parse(scope.scopeData) as ScopeData;  
    const subServiceIds = parsedScopeData.sub_service_ids ?? [];  
  
    const allSubServices = await db.select().from(subServices);  
    const allServices = await db.select().from(services);  
  
    const selectedSubServices = allSubServices  
      .filter((item) => subServiceIds.includes(item.id))  
      .map((subService) => {  
        const service = allServices.find((svc) => svc.id === subService.serviceId);  
        return {  
          id: subService.id,  
          name: subService.name,  
          code: subService.code,  
          serviceId: subService.serviceId,  
          serviceName: service?.name ?? "-",  
        };  
      });  
  
    return {  
      id: scope.id,  
      partnerUserId: scope.partnerUserId,  
      activeCount: scope.activeCount,  
      passedCount: scope.passedCount,  
      progressPercentage: Number(scope.progressPercentage),  
      subServiceIds,  
      subServices: selectedSubServices,  
    };  
  }  
  
  async calculatePartnerProgress(partnerUserId: string) {  
    const db = await getDb();  
  
    const scopeRows = await db  
      .select()  
      .from(partnerScopes)  
      .where(eq(partnerScopes.partnerUserId, partnerUserId))  
      .limit(1);  
  
    if (scopeRows.length === 0) {  
      return null;  
    }  
  
    const scope = scopeRows[0];  
  
    const progressRows = await db  
      .select()  
      .from(partnerProgress)  
      .where(eq(partnerProgress.partnerUserId, partnerUserId));  
  
    const passedCount = progressRows.filter(  
      (row) => row.overallStatus === "fully_passed"  
    ).length;  
  
    const totalActive = scope.activeCount;  
    const percentage =  
      totalActive > 0 ? ((passedCount / totalActive) * 100).toFixed(2) : "0.00";  
  
    await db  
      .update(partnerScopes)  
      .set({  
        passedCount,  
        progressPercentage: percentage,  
        updatedAt: new Date(),  
      })  
      .where(eq(partnerScopes.partnerUserId, partnerUserId));  
  
    return {  
      totalActive,  
      passedCount,  
      progressPercentage: Number(percentage),  
    };  
  }  
}  
  
export const scopeService = new ScopeService();
import { and, desc, eq } from "drizzle-orm";  
import { getDb } from "@/lib/auth/db";  
import {  
  services,  
  subServices,  
  trackADocumentContents,  
  trackADocuments,  
} from "@/db/schema";  
  
export class TrackARepository {  
  async findByPartnerSubServiceAndCaseType(  
    partnerUserId: string,  
    subServiceId: string,  
    caseType: "positive" | "negative"  
  ) {  
    const db = await getDb();  
  
    const rows = await db  
      .select()  
      .from(trackADocuments)  
      .where(  
        and(  
          eq(trackADocuments.partnerUserId, partnerUserId),  
          eq(trackADocuments.subServiceId, subServiceId),  
          eq(trackADocuments.caseType, caseType)  
        )  
      )  
      .limit(1);  
  
    return rows[0] ?? null;  
  }  
  
  async createDocument(payload: {  
    id: string;  
    partnerUserId: string;  
    serviceId: string;  
    subServiceId: string;  
    caseType: "positive" | "negative";  
    status:  
      | "draft"  
      | "uploaded"  
      | "validated"  
      | "waiting_sync"  
      | "synced"  
      | "archived";  
    fileName: string;  
    mimeType: string;  
    fileSize: number;  
    uploadedAt: Date | null;  
    syncedAt: Date | null;  
    syncedToDrive: boolean;  
    driveFileId: string | null;  
    createdAt: Date;  
    updatedAt: Date;  
  }) {  
    const db = await getDb();  
    await db.insert(trackADocuments).values(payload);  
  }  
  
  async updateDocument(  
    id: string,  
    payload: Partial<{  
      status:  
        | "draft"  
        | "uploaded"  
        | "validated"  
        | "waiting_sync"  
        | "synced"  
        | "archived";  
      fileName: string;  
      mimeType: string;  
      fileSize: number;  
      uploadedAt: Date | null;  
      syncedAt: Date | null;  
      syncedToDrive: boolean;  
      driveFileId: string | null;  
      updatedAt: Date;  
    }>  
  ) {  
    const db = await getDb();  
    await db.update(trackADocuments).set(payload).where(eq(trackADocuments.id, id));  
  }  
  
  async createDocumentContent(payload: {  
    id: string;  
    documentId: string;  
    base64Content: string;  
    createdAt: Date;  
  }) {  
    const db = await getDb();  
    await db.insert(trackADocumentContents).values(payload);  
  }  
  
  async updateDocumentContent(documentId: string, base64Content: string) {  
    const db = await getDb();  
  
    await db  
      .update(trackADocumentContents)  
      .set({ base64Content })  
      .where(eq(trackADocumentContents.documentId, documentId));  
  }  
  
  async findDocumentContentByDocumentId(documentId: string) {  
    const db = await getDb();  
  
    const rows = await db  
      .select()  
      .from(trackADocumentContents)  
      .where(eq(trackADocumentContents.documentId, documentId))  
      .limit(1);  
  
    return rows[0] ?? null;  
  }  
  
  async listPartnerDocuments(partnerUserId: string) {  
    const db = await getDb();  
  
    const documents = await db  
      .select()  
      .from(trackADocuments)  
      .where(eq(trackADocuments.partnerUserId, partnerUserId))  
      .orderBy(desc(trackADocuments.updatedAt));  
  
    const allServices = await db.select().from(services);  
    const allSubServices = await db.select().from(subServices);  
  
    return documents.map((doc) => {  
      const service = allServices.find((item) => item.id === doc.serviceId);  
      const subService = allSubServices.find(  
        (item) => item.id === doc.subServiceId  
      );  
  
      return {  
        ...doc,  
        serviceName: service?.name ?? "-",  
        subServiceName: subService?.name ?? "-",  
      };  
    });  
  }  
}  
  
export const trackARepository = new TrackARepository();
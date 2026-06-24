type LogEventParams = {  
  partnerId?: string;  
  adminId?: string;  
  metadata?: Record<string, unknown>;  
};  
  
export class AuditService {  
  async logEvent(eventType: string, params: LogEventParams) {  
    // sementara console dulu kalau tabel audit belum siap  
    console.log("[AUDIT]", {  
      eventType,  
      partnerId: params.partnerId,  
      adminId: params.adminId,  
      metadata: params.metadata,  
      createdAt: new Date().toISOString(),  
    });  
  }  
}
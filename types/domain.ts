export type UserRole = "super_admin" | "partner";  
  
export type PartnerStatus = "pending" | "approved" | "rejected";  
  
export interface AppUser {  
  id: string;  
  name: string;  
  email: string;  
  role: UserRole;  
  companyName: string | null;  
  status: PartnerStatus;  
  approvedAt?: Date | null;  
  approvedBy?: string | null;  
  rejectedAt?: Date | null;  
  rejectedBy?: string | null;  
  rejectionReason?: string | null;  
}
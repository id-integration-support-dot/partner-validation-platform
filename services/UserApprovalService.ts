import { UserRepository } from "@/repositories/UserRepository";  
  
export class UserApprovalService {  
  constructor(private userRepository = new UserRepository()) {}  
  
  async getPendingPartners() {  
    return await this.userRepository.findPendingPartners();  
  }  
  
  async getAllPartners() {  
    return await this.userRepository.findAllPartners();  
  }  
  
  async updatePartnerBasicInfo(  
    targetUserId: string,  
    payload: {  
      name: string;  
      email: string;  
      companyName: string | null;  
    }  
  ) {  
    const target = await this.userRepository.findById(targetUserId);  
  
    if (!target) {  
      throw new Error("User not found");  
    }  
  
    if (target.role !== "partner") {  
      throw new Error("Only partner can be updated");  
    }  
  
    await this.userRepository.updatePartnerBasicInfo(targetUserId, payload);  
  }  
  
  async approvePartner(targetUserId: string, adminUserId: string) {  
    const target = await this.userRepository.findById(targetUserId);  
  
    if (!target) {  
      throw new Error("User not found");  
    }  
  
    if (target.role !== "partner") {  
      throw new Error("Only partner can be approved");  
    }  
  
    if (target.status !== "pending" && target.status !== "rejected") {  
      throw new Error("User cannot be approved from current status");  
    }  
  
    await this.userRepository.approvePartner(targetUserId, adminUserId);  
  }  
  
  async rejectPartner(  
    targetUserId: string,  
    adminUserId: string,  
    reason: string  
  ) {  
    const target = await this.userRepository.findById(targetUserId);  
  
    if (!target) {  
      throw new Error("User not found");  
    }  
  
    if (target.role !== "partner") {  
      throw new Error("Only partner can be rejected");  
    }  
  
    if (target.status !== "pending") {  
      throw new Error("Only pending partner can be rejected");  
    }  
  
    await this.userRepository.rejectPartner(targetUserId, adminUserId, reason);  
  }  
}
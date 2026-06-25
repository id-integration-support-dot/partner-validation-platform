import { headers } from "next/headers";  
import { redirect } from "next/navigation";  
import { getAuth } from "@/lib/auth/auth";  
import { UserApprovalService } from "@/services/UserApprovalService";  
import { SignOutButton } from "@/components/sign-out-button";  
  
export default async function AdminPartnersPage() {  
  const auth = await getAuth();  
  const session = await auth.api.getSession({  
    headers: await headers(),  
  });  
  
  if (!session) {  
    redirect("/login");  
  }  
  
  const currentUser = session.user as {  
    role?: string;  
    name?: string;  
  };  
  
  if (currentUser.role !== "super_admin") {  
    redirect("/dashboard");  
  }  
  
  const approvalService = new UserApprovalService();  
  const pendingPartners = await approvalService.getPendingPartners();  
  
  return (  
    <div  
      style={{  
        minHeight: "100vh",  
        backgroundColor: "#f5f5f5",  
        padding: "32px 24px",  
      }}  
    >  
      <div  
        style={{  
          maxWidth: "1200px",  
          margin: "0 auto",  
        }}  
      >  
        <div  
          style={{  
            display: "flex",  
            justifyContent: "space-between",  
            alignItems: "flex-start",  
            marginBottom: "24px",  
          }}  
        >  
          <div>  
            <h1  
              style={{  
                fontSize: "36px",  
                fontWeight: 700,  
                color: "#171717",  
                margin: 0,  
              }}  
            >  
              Request Register Partner  
            </h1>  
            <p  
              style={{  
                marginTop: "8px",  
                fontSize: "16px",  
                color: "#737373",  
              }}  
            >  
              Review partner yang masih menunggu approval.  
            </p>  
          </div>  
  
          <SignOutButton />  
        </div>  
  
        <div  
          style={{  
            backgroundColor: "#ffffff",  
            border: "1px solid #e5e5e5",  
            borderRadius: "16px",  
            overflow: "hidden",  
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",  
          }}  
        >  
          <div  
            style={{  
              padding: "16px 20px",  
              borderBottom: "1px solid #e5e5e5",  
              fontSize: "16px",  
              fontWeight: 600,  
              color: "#171717",  
            }}  
          >  
            Pending Requests  
          </div>  
  
          {pendingPartners.length === 0 ? (  
            <div  
              style={{  
                padding: "32px 20px",  
                textAlign: "center",  
                color: "#737373",  
                fontSize: "14px",  
              }}  
            >  
              Tidak ada request register yang pending.  
            </div>  
          ) : (  
            <div style={{ overflowX: "auto" }}>  
              <table  
                style={{  
                  width: "100%",  
                  borderCollapse: "collapse",  
                  tableLayout: "fixed",  
                }}  
              >  
                <thead>  
                  <tr style={{ backgroundColor: "#fafafa" }}>  
                    <th  
                      style={{  
                        textAlign: "left",  
                        padding: "14px 20px",  
                        fontSize: "14px",  
                        fontWeight: 600,  
                        color: "#404040",  
                        borderBottom: "1px solid #e5e5e5",  
                        width: "18%",  
                      }}  
                    >  
                      Nama  
                    </th>  
                    <th  
                      style={{  
                        textAlign: "left",  
                        padding: "14px 20px",  
                        fontSize: "14px",  
                        fontWeight: 600,  
                        color: "#404040",  
                        borderBottom: "1px solid #e5e5e5",  
                        width: "28%",  
                      }}  
                    >  
                      Email  
                    </th>  
                    <th  
                      style={{  
                        textAlign: "left",  
                        padding: "14px 20px",  
                        fontSize: "14px",  
                        fontWeight: 600,  
                        color: "#404040",  
                        borderBottom: "1px solid #e5e5e5",  
                        width: "20%",  
                      }}  
                    >  
                      Perusahaan  
                    </th>  
                    <th  
                      style={{  
                        textAlign: "left",  
                        padding: "14px 20px",  
                        fontSize: "14px",  
                        fontWeight: 600,  
                        color: "#404040",  
                        borderBottom: "1px solid #e5e5e5",  
                        width: "14%",  
                      }}  
                    >  
                      Status  
                    </th>  
                    <th  
                      style={{  
                        textAlign: "left",  
                        padding: "14px 20px",  
                        fontSize: "14px",  
                        fontWeight: 600,  
                        color: "#404040",  
                        borderBottom: "1px solid #e5e5e5",  
                        width: "20%",  
                      }}  
                    >  
                      Action  
                    </th>  
                  </tr>  
                </thead>  
  
                <tbody>  
                  {pendingPartners.map((partner) => (  
                    <tr key={partner.id}>  
                      <td  
                        style={{  
                          padding: "16px 20px",  
                          fontSize: "14px",  
                          color: "#171717",  
                          borderBottom: "1px solid #f0f0f0",  
                          verticalAlign: "middle",  
                        }}  
                      >  
                        {partner.name}  
                      </td>  
  
                      <td  
                        style={{  
                          padding: "16px 20px",  
                          fontSize: "14px",  
                          color: "#404040",  
                          borderBottom: "1px solid #f0f0f0",  
                          verticalAlign: "middle",  
                          wordBreak: "break-word",  
                        }}  
                      >  
                        {partner.email}  
                      </td>  
  
                      <td  
                        style={{  
                          padding: "16px 20px",  
                          fontSize: "14px",  
                          color: "#404040",  
                          borderBottom: "1px solid #f0f0f0",  
                          verticalAlign: "middle",  
                        }}  
                      >  
                        {partner.companyName ?? "-"}  
                      </td>  
  
                      <td  
                        style={{  
                          padding: "16px 20px",  
                          borderBottom: "1px solid #f0f0f0",  
                          verticalAlign: "middle",  
                        }}  
                      >  
                        <span  
                          style={{  
                            display: "inline-block",  
                            padding: "6px 10px",  
                            borderRadius: "999px",  
                            backgroundColor: "#fef3c7",  
                            color: "#92400e",  
                            fontSize: "12px",  
                            fontWeight: 600,  
                            textTransform: "capitalize",  
                          }}  
                        >  
                          {partner.status}  
                        </span>  
                      </td>  
  
                      <td  
                        style={{  
                          padding: "16px 20px",  
                          borderBottom: "1px solid #f0f0f0",  
                          verticalAlign: "middle",  
                        }}  
                      >  
                        <div  
                          style={{  
                            display: "flex",  
                            gap: "10px",  
                            alignItems: "center",  
                            flexWrap: "wrap",  
                          }}  
                        >  
                          <form  
                            action={`/api/admin/partners/${partner.id}/approve`}  
                            method="post"  
                            style={{ margin: 0 }}  
                          >  
                            <button  
                              type="submit"  
                              style={{  
                                backgroundColor: "#16a34a",  
                                color: "#ffffff",  
                                border: "none",  
                                borderRadius: "8px",  
                                padding: "10px 16px",  
                                fontSize: "14px",  
                                fontWeight: 600,  
                                cursor: "pointer",  
                                minWidth: "96px",  
                              }}  
                            >  
                              Approve  
                            </button>  
                          </form>  
  
                          <form  
                            action={`/api/admin/partners/${partner.id}/reject`}  
                            method="post"  
                            style={{ margin: 0 }}  
                          >  
                            <input  
                              type="hidden"  
                              name="reason"  
                              value="Rejected by admin"  
                            />  
                            <button  
                              type="submit"  
                              style={{  
                                backgroundColor: "#dc2626",  
                                color: "#ffffff",  
                                border: "none",  
                                borderRadius: "8px",  
                                padding: "10px 16px",  
                                fontSize: "14px",  
                                fontWeight: 600,  
                                cursor: "pointer",  
                                minWidth: "96px",  
                              }}  
                            >  
                              Reject  
                            </button>  
                          </form>  
                        </div>  
                      </td>  
                    </tr>  
                  ))}  
                </tbody>  
              </table>  
            </div>  
          )}  
        </div>  
      </div>  
    </div>  
  );  
}
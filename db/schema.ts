import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Tabel "user" — dipakai Better Auth, ditambah field khusus platform kita.
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

  // --- Field custom Partner Integration Platform ---
  // role menentukan partner vs internal admin
  role: text("role", { enum: ["super_admin", "partner"] })
    .notNull()
    .default("partner"),
  // nama perusahaan partner (kosong untuk admin)
  companyName: text("company_name"),
  // status approval — partner baru selalu "pending" sampai di-approve admin
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
});

// Tabel "session" — satu baris = satu sesi login aktif.
// Single Active Session diterapkan lewat hook di lib/auth.ts, bukan di sini.
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Tabel "account" — dipakai Better Auth untuk simpan password hash
// (provider "credential") dan nantinya OAuth kalau ditambah di masa depan.
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Tabel "verification" — dipakai Better Auth untuk token verifikasi email,
// reset password, dll.
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});
export const services = sqliteTable("services", {  
  id: text("id").primaryKey(),  
  name: text("name").notNull().unique(),  
  description: text("description"),  
  iconUrl: text("icon_url"),  
  orderIndex: integer("order_index").notNull().default(0),  
  active: integer("active", { mode: "boolean" }).notNull().default(true),  
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),  
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),  
});  
  
export const subServices = sqliteTable("sub_services", {  
  id: text("id").primaryKey(),  
  serviceId: text("service_id")  
    .notNull()  
    .references(() => services.id, { onDelete: "cascade" }),  
  name: text("name").notNull(),  
  code: text("code").notNull().unique(),  
  description: text("description"),  
  orderIndex: integer("order_index").notNull().default(0),  
  active: integer("active", { mode: "boolean" }).notNull().default(true),  
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),  
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),  
});  
  
export const partnerScopes = sqliteTable("partner_scopes", {  
  id: text("id").primaryKey(),  
  partnerUserId: text("partner_user_id")  
    .notNull()  
    .unique()  
    .references(() => user.id, { onDelete: "cascade" }),  
  scopeData: text("scope_data").notNull(),  
  activeCount: integer("active_count").notNull().default(0),  
  passedCount: integer("passed_count").notNull().default(0),  
  progressPercentage: text("progress_percentage").notNull().default("0.00"),  
  scopeSetAt: integer("scope_set_at", { mode: "timestamp" }),  
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),  
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),  
});  
  
export const partnerProgress = sqliteTable("partner_progress", {  
  id: text("id").primaryKey(),  
  partnerUserId: text("partner_user_id")  
    .notNull()  
    .references(() => user.id, { onDelete: "cascade" }),  
  subServiceId: text("sub_service_id")  
    .notNull()  
    .references(() => subServices.id, { onDelete: "cascade" }),  
  trackAStatus: text("track_a_status").notNull().default("pending"),  
  trackBStatus: text("track_b_status").notNull().default("pending"),  
  overallStatus: text("overall_status").notNull().default("pending"),  
  trackAPassedAt: integer("track_a_passed_at", { mode: "timestamp" }),  
  trackBPassedAt: integer("track_b_passed_at", { mode: "timestamp" }),  
  notes: text("notes"),  
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),  
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),  
});  

export const trackADocuments = sqliteTable("track_a_documents", {  
  id: text("id").primaryKey(),  
  
  partnerUserId: text("partner_user_id")  
    .notNull()  
    .references(() => user.id, { onDelete: "cascade" }),  
  
  serviceId: text("service_id")  
    .notNull()  
    .references(() => services.id, { onDelete: "cascade" }),  
  
  subServiceId: text("sub_service_id")  
    .notNull()  
    .references(() => subServices.id, { onDelete: "cascade" }),  
  
  caseType: text("case_type", {  
    enum: ["positive", "negative"],  
  }).notNull(),  
  
  status: text("status", {  
    enum: [  
      "draft",  
      "uploaded",  
      "validated",  
      "waiting_sync",  
      "synced",  
      "archived",  
    ],  
  })  
    .notNull()  
    .default("draft"),  
  
  fileName: text("file_name").notNull(),  
  mimeType: text("mime_type").notNull(),  
  fileSize: integer("file_size").notNull(),  
  
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }),  
  syncedAt: integer("synced_at", { mode: "timestamp" }),  
  syncedToDrive: integer("synced_to_drive", { mode: "boolean" })  
    .notNull()  
    .default(false),  
  
  driveFileId: text("drive_file_id"),  
  
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),  
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),  
});  
  
export const trackADocumentContents = sqliteTable("track_a_document_contents", {  
  id: text("id").primaryKey(),  
  
  documentId: text("document_id")  
    .notNull()  
    .unique()  
    .references(() => trackADocuments.id, { onDelete: "cascade" }),  
  
  base64Content: text("base64_content").notNull(),  
  
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),  
});

export const schema = {  
  user,  
  session,  
  account,  
  verification,  
  services,  
  subServices,  
  partnerScopes,  
  partnerProgress,
  trackADocuments,  
  trackADocumentContents,  
};
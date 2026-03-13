import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";

export const firms = pgTable("firms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  phoneCountryCode: text("phone_country_code"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  pan: text("pan"),
  gst: text("gst"),
  bankDetails: jsonb("bank_details"),
  upiId: text("upi_id"),
  qrCode: text("qr_code"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rolesEnum = pgEnum("role_value", [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "EMPLOYEE",
  "ARTICLE",
]);

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  value: rolesEnum("value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const permissionScopeEnum = pgEnum("permission_scope", [
  "all",
  "below",
  "same_or_below",
]);

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  action: text("action").notNull(),
  subject: text("subject").notNull(),
  scope: permissionScopeEnum("scope"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]
);

export const roleHierarchy = pgTable("role_hierarchy", {
  roleId: uuid("role_id")
    .primaryKey()
    .references(() => roles.id, { onDelete: "cascade" }),
  parentRoleId: uuid("parent_role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
});

export const superAdmins = pgTable("super_admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const family = pgTable("family", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  address: text("address"),
  phone1CountryCode: text("phone_1_country_code"),
  phone1Number: text("phone_1_number"),
  phone2CountryCode: text("phone_2_country_code"),
  phone2Number: text("phone_2_number"),
  email1: text("email_1"),
  email2: text("email_2"),
  pan: text("pan"),
  gst: text("gst"),
  bankDetails: jsonb("bank_details"),
  dsc: text("dsc"),
  otp: text("otp"),
  familyId: uuid("family_id").references(() => family.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  address: text("address"),
  phoneCountryCode: text("phone_country_code"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  ref: text("ref"),
  bankDetails: jsonb("bank_details"),
  pan: text("pan"),
  aadhaarDetails: jsonb("aadhaar_details"),
  upiId: text("upi_id"),
  qrCode: text("qr_code"),
  joiningDate: timestamp("joining_date", { withTimezone: true }),
  leavingDate: timestamp("leaving_date", { withTimezone: true }),
  roleId: uuid("role_id").references(() => roles.id, {
    onDelete: "set null",
  }),
  profilePicture: text("profile_picture"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type FirmRow = typeof firms.$inferSelect;
export type FirmInsert = typeof firms.$inferInsert;
export type RoleRow = typeof roles.$inferSelect;
export type RoleInsert = typeof roles.$inferInsert;
export type PermissionRow = typeof permissions.$inferSelect;
export type RolePermissionRow = typeof rolePermissions.$inferSelect;
export type RoleHierarchyRow = typeof roleHierarchy.$inferSelect;
export type SuperAdminRow = typeof superAdmins.$inferSelect;
export type SuperAdminInsert = typeof superAdmins.$inferInsert;
export type ClientRow = typeof clients.$inferSelect;
export type ClientInsert = typeof clients.$inferInsert;
export type FamilyRow = typeof family.$inferSelect;
export type FamilyInsert = typeof family.$inferInsert;
export type EmployeeRow = typeof employees.$inferSelect;
export type EmployeeInsert = typeof employees.$inferInsert;

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
]);

export const inquiryTypes = pgTable("inquiry_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documentMaster = pgTable("document_master", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  assignmentTypeId: uuid("assignment_type_id").references(
    () => inquiryTypes.id,
    { onDelete: "set null" }
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const assignmentTermTemplates = pgTable("assignment_term_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentTypeId: uuid("assignment_type_id").references(
    () => inquiryTypes.id,
    { onDelete: "set null" }
  ),
  name: text("name").notNull(),
  content: jsonb("content"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const paymentTermTemplates = pgTable("payment_term_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentTypeId: uuid("assignment_type_id").references(
    () => inquiryTypes.id,
    { onDelete: "set null" }
  ),
  name: text("name").notNull(),
  content: jsonb("content"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: inquiryStatusEnum("status").notNull().default("PENDING"),
  assignmentTypeId: uuid("assignment_type_id")
    .notNull()
    .references(() => inquiryTypes.id, { onDelete: "restrict" }),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhoneCountryCode: text("contact_phone_country_code"),
  contactPhoneNumber: text("contact_phone_number"),
  contactPhone2CountryCode: text("contact_phone_2_country_code"),
  contactPhone2Number: text("contact_phone_2_number"),
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  assignmentTermsSnapshot: jsonb("assignment_terms_snapshot"),
  paymentTermsSnapshot: jsonb("payment_terms_snapshot"),
  assignmentTermTemplateId: uuid("assignment_term_template_id").references(
    () => assignmentTermTemplates.id,
    { onDelete: "set null" }
  ),
  paymentTermTemplateId: uuid("payment_term_template_id").references(
    () => paymentTermTemplates.id,
    { onDelete: "set null" }
  ),
  emailedAt: timestamp("emailed_at", { withTimezone: true }),
  whatsappSentAt: timestamp("whatsapp_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inquiryDocuments = pgTable(
  "inquiry_documents",
  {
    inquiryId: uuid("inquiry_id")
      .notNull()
      .references(() => inquiries.id, { onDelete: "cascade" }),
    documentMasterId: uuid("document_master_id")
      .notNull()
      .references(() => documentMaster.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.inquiryId, t.documentMasterId] })]
);

export type InquiryTypeRow = typeof inquiryTypes.$inferSelect;
export type InquiryTypeInsert = typeof inquiryTypes.$inferInsert;
export type DocumentMasterRow = typeof documentMaster.$inferSelect;
export type DocumentMasterInsert = typeof documentMaster.$inferInsert;
export type AssignmentTermTemplateRow =
  typeof assignmentTermTemplates.$inferSelect;
export type AssignmentTermTemplateInsert =
  typeof assignmentTermTemplates.$inferInsert;
export type PaymentTermTemplateRow = typeof paymentTermTemplates.$inferSelect;
export type PaymentTermTemplateInsert = typeof paymentTermTemplates.$inferInsert;
export type InquiryRow = typeof inquiries.$inferSelect;
export type InquiryInsert = typeof inquiries.$inferInsert;
export type InquiryDocumentRow = typeof inquiryDocuments.$inferSelect;
export type InquiryDocumentInsert = typeof inquiryDocuments.$inferInsert;

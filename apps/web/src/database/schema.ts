import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  numeric,
  date,
  jsonb,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', [
  'ADMIN',
  'MANAGER',
  'LEAD_OFFICER',
  'TECHNICAL_OFFICER',
  'COMPLIANCE_OFFICER',
]);

export const caseStatusEnum = pgEnum('case_status', [
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'UNDER_REVIEW',
  'COMPLETED',
  'REJECTED',
]);

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: roleEnum('name').notNull().unique(),
  description: text('description'),
  permissions: jsonb('permissions').$type<string[]>().default([]).notNull(),
});

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
  }),
);

export const cases = pgTable('cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseNumber: varchar('case_number', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: caseStatusEnum('status').default('PENDING').notNull(),
  priority: varchar('priority', { length: 20 }).default('MEDIUM').notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  createdById: uuid('created_by_id')
    .references(() => users.id)
    .notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const facilities = pgTable('facilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 100 }).notNull(),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const uploads = pgTable('uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  facilityId: uuid('facility_id').references(() => facilities.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const claims = pgTable('claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploadId: uuid('upload_id').references(() => uploads.id),
  caseId: uuid('case_id').references(() => cases.id),
  claimNumber: varchar('claim_number', { length: 100 }).notNull().unique(),
  paperCode: varchar('paper_code', { length: 100 }),
  dispensingDate: date('dispensing_date'),
  patientName: varchar('patient_name', { length: 255 }).notNull(),
  patientId: varchar('patient_id', { length: 100 }).notNull(),
  patientType: varchar('patient_type', { length: 100 }),
  gender: varchar('gender', { length: 50 }),
  isNewborn: boolean('is_newborn'),
  ramaNumber: varchar('rama_number', { length: 100 }),
  practitionerName: varchar('practitioner_name', { length: 255 }),
  practitionerType: varchar('practitioner_type', { length: 100 }),
  facilityId: uuid('facility_id').references(() => facilities.id).notNull(),
  status: varchar('status', { length: 50 }).default('UNREVIEWED').notNull(),
  totalAmount: numeric('total_amount').$type<number>().notNull(),
  patientCopayment: numeric('patient_copayment').$type<number>(),
  insuranceCopayment: numeric('insurance_copayment').$type<number>(),
  duplicateFlag: boolean('duplicate_flag').default(false).notNull(),
  duplicateScore: integer('duplicate_score'),
  crossFacilityFlag: boolean('cross_facility_flag').default(false).notNull(),
  crossFacilityScore: integer('cross_facility_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verificationQueue = pgTable('verification_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id').references(() => claims.id).notNull(),
  batchId: uuid('batch_id'),
  priority: integer('priority').default(0).notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const verificationResults = pgTable('verification_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id').references(() => claims.id).notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  score: integer('score').default(0).notNull(),
  findings: jsonb('findings'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const findings = pgTable('findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id').references(() => claims.id).notNull(),
  caseId: uuid('case_id').references(() => cases.id).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  findingType: varchar('finding_type', { length: 100 }).notNull(),
  description: text('description').notNull(),
  adjustmentAmount: numeric('adjustment_amount').$type<number>().default(0).notNull(),
  severity: varchar('severity', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('OPEN').notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const officerMetrics = pgTable('officer_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  officerId: uuid('officer_id').references(() => users.id).notNull(),
  claimsReviewed: integer('claims_reviewed').default(0).notNull(),
  findingsCreated: integer('findings_created').default(0).notNull(),
  adjustmentsGenerated: numeric('adjustments_generated').$type<number>().default(0).notNull(),
  casesCompleted: integer('cases_completed').default(0).notNull(),
  reviewTimeMinutes: integer('review_time_minutes').default(0).notNull(),
  metricDate: date('metric_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id'),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  type: varchar('type', { length: 50 }).default('INFO').notNull(),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const systemSettings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  assignedCases: many(cases, { relationName: 'assignedTo' }),
  createdCases: many(cases, { relationName: 'createdBy' }),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const casesRelations = relations(cases, ({ one }) => ({
  assignedTo: one(users, {
    fields: [cases.assignedToId],
    references: [users.id],
    relationName: 'assignedTo',
  }),
  createdBy: one(users, {
    fields: [cases.createdById],
    references: [users.id],
    relationName: 'createdBy',
  }),
}));

import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
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

export const claimStatusEnum = pgEnum('claim_status', [
  'UNREVIEWED',
  'IN_PROGRESS',
  'VERIFIED',
  'FLAGGED',
]);

export const findingCategoryEnum = pgEnum('finding_category', [
  'PHARMACOLOGY',
  'RSSB_RULES',
  'FRAUD',
  'DOCUMENTATION',
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

export const casesRelations = relations(cases, ({ one, many }) => ({
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
  claims: many(claims),
}));

export const claims = pgTable('claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id')
    .notNull()
    .references(() => cases.id, { onDelete: 'cascade' }),
  claimNumber: varchar('claim_number', { length: 50 }).notNull(),
  paperCode: varchar('paper_code', { length: 50 }),
  patientName: varchar('patient_name', { length: 255 }).notNull(),
  ramaNumber: varchar('rama_number', { length: 50 }),
  practitionerName: varchar('practitioner_name', { length: 255 }),
  serviceDate: timestamp('service_date'),
  totalCost: integer('total_cost').default(0).notNull(),
  patientCopayment: integer('patient_copayment').default(0).notNull(),
  insuranceCopayment: integer('insurance_copayment').default(0).notNull(),
  status: claimStatusEnum('status').default('UNREVIEWED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const claimsRelations = relations(claims, ({ one, many }) => ({
  case: one(cases, {
    fields: [claims.caseId],
    references: [cases.id],
  }),
  findings: many(findings),
  summary: one(claimVerificationSummary, {
    fields: [claims.id],
    references: [claimVerificationSummary.claimId],
  }),
}));

export const findings = pgTable('findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id')
    .notNull()
    .references(() => claims.id, { onDelete: 'cascade' }),
  caseId: uuid('case_id')
    .notNull()
    .references(() => cases.id, { onDelete: 'cascade' }),
  category: findingCategoryEnum('category').notNull(),
  findingType: varchar('finding_type', { length: 100 }).notNull(),
  description: text('description'),
  adjustmentAmount: integer('adjustment_amount').default(0).notNull(),
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const findingsRelations = relations(findings, ({ one }) => ({
  claim: one(claims, {
    fields: [findings.claimId],
    references: [claims.id],
  }),
  case: one(cases, {
    fields: [findings.caseId],
    references: [cases.id],
  }),
  createdBy: one(users, {
    fields: [findings.createdById],
    references: [users.id],
  }),
}));

export const claimVerificationSummary = pgTable('claim_verification_summary', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id')
    .notNull()
    .unique()
    .references(() => claims.id, { onDelete: 'cascade' }),
  originalAmount: integer('original_amount').default(0).notNull(),
  totalAdjustments: integer('total_adjustments').default(0).notNull(),
  verifiedAmount: integer('verified_amount').default(0).notNull(),
  findingCount: integer('finding_count').default(0).notNull(),
  status: claimStatusEnum('status').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const officerMetrics = pgTable('officer_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  claimsReviewed: integer('claims_reviewed').default(0).notNull(),
  findingsCreated: integer('findings_created').default(0).notNull(),
  adjustmentsMade: integer('adjustments_made').default(0).notNull(),
  casesCompleted: integer('cases_completed').default(0).notNull(),
  averageReviewTime: integer('average_review_time').default(0).notNull(), // in seconds
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const officerMetricsRelations = relations(officerMetrics, ({ one }) => ({
  user: one(users, {
    fields: [officerMetrics.userId],
    references: [users.id],
  }),
}));

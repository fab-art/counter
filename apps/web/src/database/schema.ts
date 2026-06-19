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
  index,
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
  'UNDER_SUPERVISOR_REVIEW',
  'SUPERVISOR_APPROVED',
  'SUPERVISOR_REJECTED',
  'ESCALATED',
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

export const branches = pgTable('branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  location: text('location'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const branchUsers = pgTable('branch_users', {
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.branchId, t.userId] }),
}));

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  role: roleEnum('role').default('TECHNICAL_OFFICER').notNull(),
  facilityId: uuid('facility_id').references(() => facilities.id),
  branchId: uuid('branch_id').references(() => branches.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  branchId: uuid('branch_id').references(() => branches.id),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (t) => ({
  caseNumberIdx: index('case_number_idx').on(t.caseNumber),
  branchIdIdx: index('case_branch_id_idx').on(t.branchId),
}));

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
  uploadId: uuid('upload_id').references(() => uploads.id, { onDelete: 'set null' }),
  caseId: uuid('case_id').references(() => cases.id, { onDelete: 'cascade' }),
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
  status: claimStatusEnum('status').default('UNREVIEWED').notNull(),
  totalAmount: numeric('total_amount').$type<number>().notNull(),
  patientCopayment: numeric('patient_copayment').$type<number>(),
  insuranceCopayment: numeric('insurance_copayment').$type<number>(),
  duplicateFlag: boolean('duplicate_flag').default(false).notNull(),
  duplicateScore: integer('duplicate_score'),
  crossFacilityFlag: boolean('cross_facility_flag').default(false).notNull(),
  crossFacilityScore: integer('cross_facility_score'),
  riskScore: integer('risk_score').default(0),
  riskCategory: varchar('risk_category', { length: 50 }),
  branchId: uuid('branch_id').references(() => branches.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  claimNumberIdx: index('claim_number_idx').on(t.claimNumber),
  patientIdIdx: index('patient_id_idx').on(t.patientId),
  branchIdIdx: index('claim_branch_id_idx').on(t.branchId),
  caseIdIdx: index('claim_case_id_idx').on(t.caseId),
}));

export const riskRules = pgTable('risk_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  riskLevel: varchar('risk_level', { length: 20 }).notNull(),
  criteria: jsonb('criteria').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const riskScores = pgTable('risk_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id').references(() => claims.id, { onDelete: 'cascade' }).notNull(),
  score: integer('score').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  reasons: jsonb('reasons').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const facilityMetrics = pgTable('facility_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  facilityId: uuid('facility_id').references(() => facilities.id, { onDelete: 'cascade' }).notNull(),
  metricDate: date('metric_date').notNull(),
  claimsSubmitted: integer('claims_submitted').default(0).notNull(),
  claimsApproved: integer('claims_approved').default(0).notNull(),
  claimsRejected: integer('claims_rejected').default(0).notNull(),
  claimsFlagged: integer('claims_flagged').default(0).notNull(),
  totalAmount: numeric('total_amount').$type<number>().default(0).notNull(),
  deductionAmount: numeric('deduction_amount').$type<number>().default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const medicineMetrics = pgTable('medicine_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  medicineCode: varchar('medicine_code', { length: 100 }).notNull(),
  medicineName: varchar('medicine_name', { length: 255 }).notNull(),
  metricDate: date('metric_date').notNull(),
  utilizationCount: integer('utilization_count').default(0).notNull(),
  flaggedCount: integer('flagged_count').default(0).notNull(),
  rejectedCount: integer('rejected_count').default(0).notNull(),
  totalCost: numeric('total_cost').$type<number>().default(0).notNull(),
  totalDeductions: numeric('total_deductions').$type<number>().default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reportSchedules = pgTable('report_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reportType: varchar('report_type', { length: 100 }).notNull(),
  frequency: varchar('frequency', { length: 20 }).notNull(),
  lastRun: timestamp('last_run'),
  nextRun: timestamp('next_run'),
  recipients: jsonb('recipients').$type<string[]>().default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const imports = pgTable('imports', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  totalRecords: integer('total_records').default(0).notNull(),
  processedRecords: integer('processed_records').default(0).notNull(),
  errorCount: integer('error_count').default(0).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const importBatches = pgTable('import_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  importId: uuid('import_id').references(() => imports.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const importErrors = pgTable('import_errors', {
  id: uuid('id').primaryKey().defaultRandom(),
  importId: uuid('import_id').references(() => imports.id, { onDelete: 'cascade' }).notNull(),
  rowNumber: integer('row_number').notNull(),
  errorMessage: text('error_message').notNull(),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviewDecisions = pgTable('review_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id').references(() => claims.id, { onDelete: 'cascade' }).notNull(),
  reviewerId: uuid('reviewer_id').references(() => users.id).notNull(),
  decision: varchar('decision', { length: 50 }).notNull(), // APPROVED, REJECTED, ESCALATED
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviewComments = pgTable('review_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id').references(() => claims.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const verificationQueue = pgTable('verification_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id').references(() => claims.id, { onDelete: 'cascade' }).notNull(),
  batchId: uuid('batch_id'),
  priority: integer('priority').default(0).notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const verificationResults = pgTable('verification_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id').references(() => claims.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  score: integer('score').default(0).notNull(),
  findings: jsonb('findings'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const findings = pgTable('findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id').references(() => claims.id, { onDelete: 'cascade' }).notNull(),
  caseId: uuid('case_id').references(() => cases.id, { onDelete: 'cascade' }).notNull(),
  category: findingCategoryEnum('category').notNull(),
  findingType: varchar('finding_type', { length: 100 }).notNull(),
  description: text('description').notNull(),
  adjustmentAmount: numeric('adjustment_amount').$type<number>().default(0).notNull(),
  severity: varchar('severity', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('OPEN').notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  claimIdIdx: index('finding_claim_id_idx').on(t.claimId),
  caseIdIdx: index('finding_case_id_idx').on(t.caseId),
}));

export const claimVerificationSummary = pgTable('claim_verification_summary', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id')
    .notNull()
    .unique()
    .references(() => claims.id, { onDelete: 'cascade' }),
  originalAmount: numeric('original_amount').$type<number>().default(0).notNull(),
  totalAdjustments: numeric('total_adjustments').$type<number>().default(0).notNull(),
  verifiedAmount: numeric('verified_amount').$type<number>().default(0).notNull(),
  findingCount: integer('finding_count').default(0).notNull(),
  status: claimStatusEnum('status').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const officerMetrics = pgTable('officer_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  officerId: uuid('officer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
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
}, (t) => ({
  userIdIdx: index('audit_user_id_idx').on(t.userId),
  actionIdx: index('audit_action_idx').on(t.action),
  entityIdx: index('audit_entity_idx').on(t.entityType, t.entityId),
}));

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
  officerMetrics: many(officerMetrics),
  branchUsers: many(branchUsers),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  branchUsers: many(branchUsers),
  cases: many(cases),
  claims: many(claims),
}));

export const branchUsersRelations = relations(branchUsers, ({ one }) => ({
  branch: one(branches, { fields: [branchUsers.branchId], references: [branches.id] }),
  user: one(users, { fields: [branchUsers.userId], references: [users.id] }),
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
  branch: one(branches, { fields: [cases.branchId], references: [branches.id] }),
  claims: many(claims),
  findings: many(findings),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  upload: one(uploads, {
    fields: [claims.uploadId],
    references: [uploads.id],
  }),
  case: one(cases, {
    fields: [claims.caseId],
    references: [cases.id],
  }),
  facility: one(facilities, {
    fields: [claims.facilityId],
    references: [facilities.id],
  }),
  branch: one(branches, { fields: [claims.branchId], references: [branches.id] }),
  findings: many(findings),
  verificationResult: one(verificationResults, {
    fields: [claims.id],
    references: [verificationResults.claimId],
  }),
  summary: one(claimVerificationSummary, {
    fields: [claims.id],
    references: [claimVerificationSummary.claimId],
  }),
  riskScores: many(riskScores),
  reviewDecisions: many(reviewDecisions),
  reviewComments: many(reviewComments),
}));

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
    fields: [findings.createdBy],
    references: [users.id],
  }),
}));

export const claimVerificationSummaryRelations = relations(claimVerificationSummary, ({ one }) => ({
  claim: one(claims, {
    fields: [claimVerificationSummary.claimId],
    references: [claims.id],
  }),
}));

export const officerMetricsRelations = relations(officerMetrics, ({ one }) => ({
  user: one(users, {
    fields: [officerMetrics.officerId],
    references: [users.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
  facility: one(facilities, {
    fields: [profiles.facilityId],
    references: [facilities.id],
  }),
  branch: one(branches, {
    fields: [profiles.branchId],
    references: [branches.id],
  }),
}));

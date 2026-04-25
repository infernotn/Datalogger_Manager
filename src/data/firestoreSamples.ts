/**
 * Firestore Data Samples
 * Complete sample data for DataLogger Manager application
 * Use these to seed your Firestore database for testing and development
 */

import { User, Datalogger, Usage, AuditLog } from "../types";

// ============================================================================
// USERS COLLECTION
// ============================================================================

export const sampleUsers: User[] = [
  {
    id: "user_admin_001",
    email: "admin@datalogger.com",
    username: "admin_user",
    role: "ADMIN",
    pinCode: "$2b$10$Nw7BqkYtTw8R5qZ2x9nY5.example", // hashed PIN: 1234
    permissions: [
      "CREATE_DATALOGGER",
      "EDIT_DATALOGGER",
      "DELETE_DATALOGGER",
      "ASSIGN_USAGE",
      "CLOSE_USAGE",
      "EDIT_CALIBRATION",
      "VIEW_AUDIT",
    ],
    active: true,
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "user_quality_001",
    email: "quality@datalogger.com",
    username: "quality_manager",
    role: "USER",
    pinCode: "$2b$10$Bx8RqkYtTw8R5qZ2x9nY5.example", // hashed PIN: 5678
    permissions: [
      "EDIT_DATALOGGER",
      "ASSIGN_USAGE",
      "CLOSE_USAGE",
      "EDIT_CALIBRATION",
      "VIEW_AUDIT",
    ],
    active: true,
    createdAt: "2026-01-20T09:30:00Z",
  },
  {
    id: "user_operator_001",
    email: "operator1@datalogger.com",
    username: "operator_001",
    role: "USER",
    pinCode: "$2b$10$Cx9RqkYtTw8R5qZ2x9nY5.example", // hashed PIN: 9012
    permissions: ["ASSIGN_USAGE", "CLOSE_USAGE", "VIEW_AUDIT"],
    active: true,
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "user_operator_002",
    email: "operator2@datalogger.com",
    username: "operator_002",
    role: "USER",
    pinCode: "$2b$10$Dx0RqkYtTw8R5qZ2x9nY5.example", // hashed PIN: 3456
    permissions: ["ASSIGN_USAGE", "CLOSE_USAGE", "VIEW_AUDIT"],
    active: true,
    createdAt: "2026-02-05T11:00:00Z",
  },
  {
    id: "user_calibration_001",
    email: "calibration@datalogger.com",
    username: "calibration_tech",
    role: "USER",
    pinCode: "$2b$10$Ex1RqkYtTw8R5qZ2x9nY5.example", // hashed PIN: 7890
    permissions: ["EDIT_CALIBRATION", "VIEW_AUDIT"],
    active: true,
    createdAt: "2026-02-10T12:00:00Z",
  },
  {
    id: "user_inactive_001",
    email: "inactive@datalogger.com",
    username: "inactive_user",
    role: "USER",
    pinCode: "$2b$10$Fx2RqkYtTw8R5qZ2x9nY5.example", // hashed PIN: 1111
    permissions: ["VIEW_AUDIT"],
    active: false,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

// ============================================================================
// DATALOGGERS COLLECTION
// ============================================================================

export const sampleDataloggers: Datalogger[] = [
  {
    id: "datalogger_001",
    name: "EXX-001",
    type: "ATEX",
    measurementType: "TEMPERATURE",
    calibrationPeriodMonths: 12,
    lastCalibrationDate: "2025-12-01T08:00:00Z",
    nextCalibrationDate: "2026-12-01T08:00:00Z",
    status: "AVAILABLE",
    createdAt: "2025-08-10T09:00:00Z",
    updatedAt: "2025-12-01T08:00:00Z",
  },
  {
    id: "datalogger_002",
    name: "EXX-002",
    type: "ATEX",
    measurementType: "TEMP_HUMIDITY",
    calibrationPeriodMonths: 12,
    lastCalibrationDate: "2025-11-15T10:00:00Z",
    nextCalibrationDate: "2026-11-15T10:00:00Z",
    status: "IN_USE",
    createdAt: "2025-08-15T09:30:00Z",
    updatedAt: "2026-03-25T14:30:00Z",
  },
  {
    id: "datalogger_003",
    name: "EN-001",
    type: "NON_ATEX",
    measurementType: "TEMPERATURE",
    calibrationPeriodMonths: 6,
    lastCalibrationDate: "2025-09-01T07:00:00Z",
    nextCalibrationDate: "2026-03-01T07:00:00Z",
    status: "AVAILABLE",
    createdAt: "2025-07-20T08:00:00Z",
    updatedAt: "2025-09-01T07:00:00Z",
  },
  {
    id: "datalogger_004",
    name: "EN-002",
    type: "NON_ATEX",
    measurementType: "TEMP_HUMIDITY",
    calibrationPeriodMonths: 6,
    lastCalibrationDate: "2025-08-10T11:00:00Z",
    nextCalibrationDate: "2026-02-10T11:00:00Z",
    status: "OUT_OF_SERVICE",
    createdAt: "2025-07-25T09:00:00Z",
    updatedAt: "2026-03-20T16:00:00Z",
  },
  {
    id: "datalogger_005",
    name: "EXX-003",
    type: "ATEX",
    measurementType: "TEMPERATURE",
    calibrationPeriodMonths: 12,
    lastCalibrationDate: "2025-02-20T09:00:00Z",
    nextCalibrationDate: "2026-02-20T09:00:00Z",
    status: "AVAILABLE",
    createdAt: "2025-09-01T10:00:00Z",
    updatedAt: "2025-02-20T09:00:00Z",
  },
  {
    id: "datalogger_006",
    name: "EN-003",
    type: "NON_ATEX",
    measurementType: "TEMP_HUMIDITY",
    calibrationPeriodMonths: 6,
    lastCalibrationDate: "2025-10-05T08:30:00Z",
    nextCalibrationDate: "2026-04-05T08:30:00Z",
    status: "IN_USE",
    createdAt: "2025-08-20T11:00:00Z",
    updatedAt: "2026-03-28T15:45:00Z",
  },
  {
    id: "datalogger_007",
    name: "EXX-004",
    type: "ATEX",
    measurementType: "TEMP_HUMIDITY",
    calibrationPeriodMonths: 12,
    lastCalibrationDate: "2024-12-15T07:00:00Z",
    nextCalibrationDate: "2025-12-15T07:00:00Z",
    status: "OUT_OF_SERVICE",
    createdAt: "2025-06-10T08:00:00Z",
    updatedAt: "2026-03-15T12:00:00Z",
  },
  {
    id: "datalogger_008",
    name: "EN-004",
    type: "NON_ATEX",
    measurementType: "TEMPERATURE",
    calibrationPeriodMonths: 6,
    lastCalibrationDate: "2026-02-01T09:00:00Z",
    nextCalibrationDate: "2026-08-01T09:00:00Z",
    status: "AVAILABLE",
    createdAt: "2025-09-15T10:30:00Z",
    updatedAt: "2026-02-01T09:00:00Z",
  },
];

// ============================================================================
// USAGE COLLECTION
// ============================================================================

export const sampleUsages: Usage[] = [
  {
    id: "usage_001",
    dataloggerId: "datalogger_002",
    usageType: "CYCLE_VALIDATION",
    startDate: "2026-03-20T08:00:00Z",
    location: "Warehouse A - Storage Zone",
    projectRef: "PROJ-2026-001",
    comments: "Temperature monitoring for product stability test",
  },
  {
    id: "usage_002",
    dataloggerId: "datalogger_006",
    usageType: "CARTOGRAPHIE",
    startDate: "2026-03-15T10:00:00Z",
    location: "Cold Room 1 - Zone B",
    projectRef: "PROJ-2026-002",
    comments: "Temperature and humidity mapping for facility validation",
  },
  {
    id: "usage_003",
    dataloggerId: "datalogger_001",
    usageType: "SUIVI_LOCAL",
    startDate: "2026-03-01T06:00:00Z",
    endDate: "2026-03-25T18:00:00Z",
    location: "Production Line 2",
    projectRef: "PROJ-2026-003",
    comments: "Continuous temperature monitoring during manufacturing",
  },
  {
    id: "usage_004",
    dataloggerId: "datalogger_003",
    usageType: "FABRICATION_WC",
    startDate: "2026-02-15T08:00:00Z",
    endDate: "2026-03-10T17:00:00Z",
    location: "Manufacturing Area - Zone C",
    projectRef: "PROJ-2026-004",
    comments: "Process validation during production run",
  },
  {
    id: "usage_005",
    dataloggerId: "datalogger_008",
    usageType: "EXPORT",
    startDate: "2026-03-10T09:00:00Z",
    endDate: "2026-03-22T15:00:00Z",
    location: "Shipping Container SCH-001",
    projectRef: "PROJ-2026-005",
    comments: "Temperature monitoring during product shipment to client",
  },
  {
    id: "usage_006",
    dataloggerId: "datalogger_005",
    usageType: "AUTRE",
    startDate: "2026-03-18T11:00:00Z",
    location: "Quality Lab - Testing Chamber",
    projectRef: "PROJ-2026-006",
    comments: "Stability testing - long term storage conditions",
  },
  {
    id: "usage_007",
    dataloggerId: "datalogger_004",
    usageType: "CYCLE_VALIDATION",
    startDate: "2026-01-20T08:00:00Z",
    endDate: "2026-02-05T17:00:00Z",
    location: "Test Chamber 1",
    projectRef: "PROJ-2025-098",
    comments: "Historical usage - validation cycle completed",
  },
];

// ============================================================================
// AUDIT LOGS COLLECTION
// ============================================================================

export const sampleAuditLogs: AuditLog[] = [
  {
    id: "audit_001",
    userId: "user_admin_001",
    userRole: "ADMIN",
    permissionUsed: "CREATE_DATALOGGER",
    action: "CREATE",
    entity: "DATALOGGER",
    entityId: "datalogger_008",
    timestamp: "2025-09-15T10:30:00Z",
    newValue: {
      name: "EN-004",
      type: "NON_ATEX",
      measurementType: "TEMPERATURE",
      calibrationPeriodMonths: 6,
    },
    comment: "New datalogger created for lab testing",
  },
  {
    id: "audit_002",
    userId: "user_quality_001",
    userRole: "USER",
    permissionUsed: "EDIT_CALIBRATION",
    action: "UPDATE_CALIBRATION",
    entity: "DATALOGGER",
    entityId: "datalogger_002",
    timestamp: "2025-11-15T10:00:00Z",
    oldValue: {
      lastCalibrationDate: "2025-10-15T08:00:00Z",
      nextCalibrationDate: "2026-10-15T08:00:00Z",
    },
    newValue: {
      lastCalibrationDate: "2025-11-15T10:00:00Z",
      nextCalibrationDate: "2026-11-15T10:00:00Z",
    },
    comment: "Calibration completed - certificate #CAL-2025-1523",
  },
  {
    id: "audit_003",
    userId: "user_operator_001",
    userRole: "USER",
    permissionUsed: "ASSIGN_USAGE",
    action: "ASSIGN_USAGE",
    entity: "USAGE",
    entityId: "usage_001",
    timestamp: "2026-03-20T08:00:00Z",
    newValue: {
      dataloggerId: "datalogger_002",
      usageType: "CYCLE_VALIDATION",
      startDate: "2026-03-20T08:00:00Z",
      location: "Warehouse A - Storage Zone",
    },
    comment: "Datalogger assigned to cycle validation project",
  },
  {
    id: "audit_004",
    userId: "user_operator_002",
    userRole: "USER",
    permissionUsed: "CLOSE_USAGE",
    action: "CLOSE_USAGE",
    entity: "USAGE",
    entityId: "usage_004",
    timestamp: "2026-03-10T17:00:00Z",
    oldValue: {
      endDate: null,
    },
    newValue: {
      endDate: "2026-03-10T17:00:00Z",
    },
    comment: "Usage completed - data exported and analyzed",
  },
  {
    id: "audit_005",
    userId: "user_admin_001",
    userRole: "ADMIN",
    permissionUsed: "EDIT_DATALOGGER",
    action: "UPDATE_STATUS",
    entity: "DATALOGGER",
    entityId: "datalogger_004",
    timestamp: "2026-03-20T16:00:00Z",
    oldValue: {
      status: "IN_USE",
    },
    newValue: {
      status: "OUT_OF_SERVICE",
    },
    comment: "Datalogger removed from service - technical maintenance required",
  },
  {
    id: "audit_006",
    userId: "user_admin_001",
    userRole: "ADMIN",
    permissionUsed: "CREATE_DATALOGGER",
    action: "CREATE_USER",
    entity: "USER",
    entityId: "user_operator_002",
    timestamp: "2026-02-05T11:00:00Z",
    newValue: {
      email: "operator2@datalogger.com",
      username: "operator_002",
      role: "USER",
      permissions: ["ASSIGN_USAGE", "CLOSE_USAGE", "VIEW_AUDIT"],
    },
    comment: "New operator account created",
  },
  {
    id: "audit_007",
    userId: "user_quality_001",
    userRole: "USER",
    permissionUsed: "EDIT_DATALOGGER",
    action: "UPDATE",
    entity: "DATALOGGER",
    entityId: "datalogger_006",
    timestamp: "2026-03-28T15:45:00Z",
    oldValue: {
      status: "AVAILABLE",
    },
    newValue: {
      status: "IN_USE",
    },
    comment: "Datalogger marked as in use for cartography project",
  },
  {
    id: "audit_008",
    userId: "user_calibration_001",
    userRole: "USER",
    permissionUsed: "EDIT_CALIBRATION",
    action: "UPDATE_CALIBRATION",
    entity: "DATALOGGER",
    entityId: "datalogger_001",
    timestamp: "2025-12-01T08:00:00Z",
    oldValue: {
      lastCalibrationDate: "2024-12-01T08:00:00Z",
      nextCalibrationDate: "2025-12-01T08:00:00Z",
    },
    newValue: {
      lastCalibrationDate: "2025-12-01T08:00:00Z",
      nextCalibrationDate: "2026-12-01T08:00:00Z",
    },
    comment: "Annual calibration completed - certificate #CAL-2025-0891",
  },
  {
    id: "audit_009",
    userId: "user_admin_001",
    userRole: "ADMIN",
    permissionUsed: "DELETE_DATALOGGER",
    action: "UPDATE",
    entity: "DATALOGGER",
    entityId: "datalogger_007",
    timestamp: "2026-03-15T12:00:00Z",
    oldValue: {
      status: "IN_USE",
    },
    newValue: {
      status: "OUT_OF_SERVICE",
    },
    comment: "Datalogger decommissioned - end of lifecycle",
  },
  {
    id: "audit_010",
    userId: "user_operator_001",
    userRole: "USER",
    permissionUsed: "ASSIGN_USAGE",
    action: "ASSIGN_USAGE",
    entity: "USAGE",
    entityId: "usage_006",
    timestamp: "2026-03-18T11:00:00Z",
    newValue: {
      dataloggerId: "datalogger_005",
      usageType: "AUTRE",
      startDate: "2026-03-18T11:00:00Z",
      location: "Quality Lab - Testing Chamber",
    },
    comment: "Datalogger assigned to stability testing",
  },
];

// ============================================================================
// EXPORT ALL SAMPLES
// ============================================================================

export const allSamples = {
  users: sampleUsers,
  dataloggers: sampleDataloggers,
  usages: sampleUsages,
  auditLogs: sampleAuditLogs,
};

// ============================================================================
// HELPER FUNCTIONS FOR SEEDING
// ============================================================================

/**
 * Get a sample user by ID
 */
export function getSampleUserById(userId: string): User | undefined {
  return sampleUsers.find((u) => u.id === userId);
}

/**
 * Get a sample datalogger by ID
 */
export function getSampleDataloggerById(dataloggerId: string): Datalogger | undefined {
  return sampleDataloggers.find((d) => d.id === dataloggerId);
}

/**
 * Get all active users
 */
export function getActiveUsers(): User[] {
  return sampleUsers.filter((u) => u.active);
}

/**
 * Get all dataloggers by status
 */
export function getDataloggersByStatus(status: Datalogger["status"]): Datalogger[] {
  return sampleDataloggers.filter((d) => d.status === status);
}

/**
 * Get all active usages (without end date)
 */
export function getActiveUsages(): Usage[] {
  return sampleUsages.filter((u) => !u.endDate);
}

/**
 * Get audit logs for a specific user
 */
export function getAuditLogsByUser(userId: string): AuditLog[] {
  return sampleAuditLogs.filter((a) => a.userId === userId);
}

/**
 * Get audit logs for a specific entity
 */
export function getAuditLogsByEntity(
  entity: AuditLog["entity"],
  entityId: string
): AuditLog[] {
  return sampleAuditLogs.filter((a) => a.entity === entity && a.entityId === entityId);
}


#!/usr/bin/env node

/**
 * Standalone Firestore Seeding Script
 *
 * Usage:
 * node seed.js
 *
 * Requirements:
 * 1. GOOGLE_APPLICATION_CREDENTIALS environment variable set with path to serviceAccountKey.json
 *    OR serviceAccountKey.json in the project root
 * 2. OR run with Firebase Emulator: firebase emulators:start --only firestore
 *
 * This script will:
 * 1. Initialize Firebase admin SDK
 * 2. Connect to your Firestore database
 * 3. Seed all sample data (31+ documents)
 * 4. Confirm completion
 */

import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// For ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sample data
const sampleUsers = [
  {
    id: "user_admin_001",
    email: "admin@datalogger.com",
    username: "admin_user",
    role: "ADMIN",
    pinCode: "$2b$10$Nw7BqkYtTw8R5qZ2x9nY5.example",
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
    pinCode: "$2b$10$Bx8RqkYtTw8R5qZ2x9nY5.example",
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
    pinCode: "$2b$10$Cx9RqkYtTw8R5qZ2x9nY5.example",
    permissions: ["ASSIGN_USAGE", "CLOSE_USAGE", "VIEW_AUDIT"],
    active: true,
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "user_operator_002",
    email: "operator2@datalogger.com",
    username: "operator_002",
    role: "USER",
    pinCode: "$2b$10$Dx0RqkYtTw8R5qZ2x9nY5.example",
    permissions: ["ASSIGN_USAGE", "CLOSE_USAGE", "VIEW_AUDIT"],
    active: true,
    createdAt: "2026-02-05T11:00:00Z",
  },
  {
    id: "user_calibration_001",
    email: "calibration@datalogger.com",
    username: "calibration_tech",
    role: "USER",
    pinCode: "$2b$10$Ex1RqkYtTw8R5qZ2x9nY5.example",
    permissions: ["EDIT_CALIBRATION", "VIEW_AUDIT"],
    active: true,
    createdAt: "2026-02-10T12:00:00Z",
  },
  {
    id: "user_inactive_001",
    email: "inactive@datalogger.com",
    username: "inactive_user",
    role: "USER",
    pinCode: "$2b$10$Fx2RqkYtTw8R5qZ2x9nY5.example",
    permissions: ["VIEW_AUDIT"],
    active: false,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

const sampleDataloggers = [
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

const sampleUsages = [
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

const sampleAuditLogs = [
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

async function main() {
  console.log('📚 Firestore Seeding Script');
  console.log('============================\n');

  try {
    // Initialize Firebase Admin SDK
    const hasApps = admin.apps && admin.apps.length > 0;

    if (!hasApps) {
      console.log('🔑 Initializing Firebase Admin SDK...\n');

      let initialized = false;

      // Try 1: Service account file in project root
      const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
      try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase initialized with service account key\n');
        initialized = true;
      } catch (err) {
        // Try 2: Check for pre-initialized app (from top-level init)
        try {
          if (admin.apps.length > 0) {
            console.log('✅ Firebase already initialized\n');
            initialized = true;
          }
        } catch (err2) {
          // Try 3: Environment variable
          try {
            admin.initializeApp({
              credential: admin.credential.applicationDefault(),
            });
            console.log('✅ Firebase initialized with GOOGLE_APPLICATION_CREDENTIALS\n');
            initialized = true;
          } catch (err3) {
            // Try 4: Firebase Emulator
            if (process.env.FIRESTORE_EMULATOR_HOST) {
              admin.initializeApp({
                projectId: 'test-project',
              });
              console.log(`✅ Firebase Emulator initialized (${process.env.FIRESTORE_EMULATOR_HOST})\n`);
              initialized = true;
            }
          }
        }
      }

      if (!initialized) {
        throw new Error(
          'Firebase Admin SDK could not be initialized.\n\n' +
          'Please set up authentication by either:\n' +
          '1. Download serviceAccountKey.json from Firebase Console and place it in the project root\n' +
          '2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable:\n' +
          '   $env:GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"\n' +
          '3. Run Firebase Emulator: firebase emulators:start --only firestore\n'
        );
      }
    }

    const db = admin.firestore();

    console.log('🌱 Starting to seed Firestore...\n');

    // Seed users
    console.log('📝 Seeding users...');
    await seedCollection(db, 'users', sampleUsers);
    console.log(`   ✅ ${sampleUsers.length} users seeded\n`);

    // Seed dataloggers
    console.log('📝 Seeding dataloggers...');
    await seedCollection(db, 'dataloggers', sampleDataloggers);
    console.log(`   ✅ ${sampleDataloggers.length} dataloggers seeded\n`);

    // Seed usages
    console.log('📝 Seeding usages...');
    await seedCollection(db, 'usages', sampleUsages);
    console.log(`   ✅ ${sampleUsages.length} usages seeded\n`);

    // Seed audit logs
    console.log('📝 Seeding audit logs...');
    await seedCollection(db, 'auditLogs', sampleAuditLogs);
    console.log(`   ✅ ${sampleAuditLogs.length} audit logs seeded\n`);

    const total = sampleUsers.length + sampleDataloggers.length + sampleUsages.length + sampleAuditLogs.length;
    console.log('🎉 Firestore seeding completed successfully!');
    console.log(`   Total documents seeded: ${total}\n`);

    await admin.app().delete();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    try {
      await admin.app().delete();
    } catch (e) {
      // Ignore cleanup errors
    }
    process.exit(1);
  }
}

async function seedCollection(db, collectionName, data) {
  const batch = db.batch();

  data.forEach((item) => {
    const docRef = db.collection(collectionName).doc(item.id);
    batch.set(docRef, item);
  });

  await batch.commit();
}

main().catch(console.error);


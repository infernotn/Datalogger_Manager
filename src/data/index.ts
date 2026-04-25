/**
 * Firestore Data Samples - Index
 * Central export point for all sample data and utilities
 */

export {
  sampleUsers,
  sampleDataloggers,
  sampleUsages,
  sampleAuditLogs,
  allSamples,
  getSampleUserById,
  getSampleDataloggerById,
  getActiveUsers,
  getDataloggersByStatus,
  getActiveUsages,
  getAuditLogsByUser,
  getAuditLogsByEntity,
} from "./firestoreSamples";

export {
  seedFirestore,
  seedCollectionOnly,
  addDocument,
  clearAllCollections,
} from "../scripts/seedFirestore";

export type { User, Datalogger, Usage, AuditLog, Permission } from "../types";


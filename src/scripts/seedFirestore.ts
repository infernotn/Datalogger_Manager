/**
 * Firestore Seeding Script
 * Use this script to populate Firestore with sample data
 *
 * Usage:
 * 1. Set your Firebase config in firebase/config.ts
 * 2. Run: npx ts-node src/scripts/seedFirestore.ts
 * 3. Or use this in your React app for initial data setup
 */

import {
  collection,
  doc,
  setDoc,
  writeBatch,
  Firestore,
  getDocs,
} from "firebase/firestore";
import {
  sampleUsers,
  sampleDataloggers,
  sampleUsages,
  sampleAuditLogs,
} from "../data/firestoreSamples";
import { User, Datalogger, Usage, AuditLog } from "../types";

/**
 * Seed all collections in Firestore with sample data
 * @param db - Firestore database instance
 */
export async function seedFirestore(db: Firestore): Promise<void> {
  console.log("🌱 Starting Firestore seeding...");

  try {
    // Seed users
    await seedCollection<User>(db, "users", sampleUsers);
    console.log(`✅ Users seeded: ${sampleUsers.length} documents`);

    // Seed dataloggers
    await seedCollection<Datalogger>(db, "dataloggers", sampleDataloggers);
    console.log(`✅ Dataloggers seeded: ${sampleDataloggers.length} documents`);

    // Seed usages
    await seedCollection<Usage>(db, "usages", sampleUsages);
    console.log(`✅ Usages seeded: ${sampleUsages.length} documents`);

    // Seed audit logs
    await seedCollection<AuditLog>(db, "auditLogs", sampleAuditLogs);
    console.log(`✅ Audit logs seeded: ${sampleAuditLogs.length} documents`);

    console.log("🎉 Firestore seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding Firestore:", error);
    throw error;
  }
}

/**
 * Generic function to seed a collection with data
 * @param db - Firestore database instance
 * @param collectionName - Name of the collection
 * @param data - Array of documents to add
 */
async function seedCollection<T extends { id: string }>(
  db: Firestore,
  collectionName: string,
  data: T[]
): Promise<void> {
  const batch = writeBatch(db);

  data.forEach((item) => {
    const docRef = doc(collection(db, collectionName), item.id);
    batch.set(docRef, item);
  });

  await batch.commit();
}

/**
 * Seed a single collection
 * @param db - Firestore database instance
 * @param collectionName - Name of the collection
 * @param data - Array of documents to add
 */
export async function seedCollectionOnly<T extends { id: string }>(
  db: Firestore,
  collectionName: string,
  data: T[]
): Promise<void> {
  await seedCollection(db, collectionName, data);
  console.log(`✅ ${collectionName} seeded: ${data.length} documents`);
}

/**
 * Add a single document to a collection
 * @param db - Firestore database instance
 * @param collectionName - Name of the collection
 * @param document - Document to add
 */
export async function addDocument<T extends { id: string }>(
  db: Firestore,
  collectionName: string,
  document: T
): Promise<void> {
  const docRef = doc(collection(db, collectionName), document.id);
  await setDoc(docRef, document);
  console.log(`✅ Document added to ${collectionName}:`, document.id);
}

/**
 * Clear all collections (USE WITH CAUTION!)
 * @param db - Firestore database instance
 */
export async function clearAllCollections(db: Firestore): Promise<void> {
  const collectionNames = ["users", "dataloggers", "usages", "auditLogs"];

  for (const collectionName of collectionNames) {
    const batch = writeBatch(db);
    const snapshot = await getDocs(collection(db, collectionName));
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    console.log(`🗑️  Cleared ${collectionName}`);
  }

  console.log("⚠️  All collections cleared!");
}

export default seedFirestore;






/**
 * Firestore Seeding Utility
 *
 * This utility provides an easy way to seed your Firestore database
 * with sample data during development.
 *
 * Usage in React component:
 *
 * import { SeedFirestoreButton } from '../utils/seedUtil';
 *
 * export function AdminPanel() {
 *   return <SeedFirestoreButton />;
 * }
 */

import { getFirestore, collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import {
  sampleUsers,
  sampleDataloggers,
  sampleUsages,
  sampleAuditLogs,
} from '../data/firestoreSamples';
import { User, Datalogger, Usage, AuditLog } from '../types';

/**
 * Seed Firestore with all sample data
 */
export async function seedFirestore(): Promise<{
  success: boolean;
  message: string;
  data?: { users: number; dataloggers: number; usages: number; auditLogs: number };
  error?: string;
}> {
  try {
    console.log('🌱 Starting Firestore seeding...');
    const db = getFirestore();

    // Seed users
    await seedCollection(db, 'users', sampleUsers);
    console.log(`✅ Users seeded: ${sampleUsers.length} documents`);

    // Seed dataloggers
    await seedCollection(db, 'dataloggers', sampleDataloggers);
    console.log(`✅ Dataloggers seeded: ${sampleDataloggers.length} documents`);

    // Seed usages
    await seedCollection(db, 'usages', sampleUsages);
    console.log(`✅ Usages seeded: ${sampleUsages.length} documents`);

    // Seed audit logs
    await seedCollection(db, 'auditLogs', sampleAuditLogs);
    console.log(`✅ Audit logs seeded: ${sampleAuditLogs.length} documents`);

    const message = '🎉 Firestore seeded successfully with 31 sample documents!';
    console.log(message);

    return {
      success: true,
      message,
      data: {
        users: sampleUsers.length,
        dataloggers: sampleDataloggers.length,
        usages: sampleUsages.length,
        auditLogs: sampleAuditLogs.length,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error seeding Firestore:', error);
    return {
      success: false,
      message: 'Failed to seed Firestore',
      error: errorMessage,
    };
  }
}

/**
 * Generic function to seed a collection
 */
async function seedCollection<T extends { id: string }>(
  db: any,
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
 * Clear all collections (USE WITH CAUTION!)
 */
export async function clearAllCollections(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    console.warn('🗑️  Clearing all collections...');
    const db = getFirestore();
    const collectionNames = ['users', 'dataloggers', 'usages', 'auditLogs'];

    for (const collectionName of collectionNames) {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, collectionName));
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      console.log(`  ✓ Cleared ${collectionName}`);
    }

    const message = '⚠️  All collections cleared!';
    console.log(message);

    return {
      success: true,
      message,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error clearing collections:', error);
    return {
      success: false,
      message: 'Failed to clear collections',
      error: errorMessage,
    };
  }
}

/**
 * React Component: Seed Firestore Button
 */
export function SeedFirestoreButton() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string>('');
  const [isSuccess, setIsSuccess] = React.useState<boolean | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setMessage('Seeding Firestore...');
    const result = await seedFirestore();
    setIsSuccess(result.success);
    setMessage(result.message);
    if (result.error) {
      setMessage(`${result.message}: ${result.error}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="font-bold mb-2">Seed Firestore (Dev Only)</h2>
      <button
        onClick={handleSeed}
        disabled={isLoading}
        className={`px-4 py-2 rounded text-white font-medium ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isLoading ? '⏳ Seeding...' : '🌱 Seed with Sample Data'}
      </button>
      {message && (
        <p
          className={`mt-2 text-sm ${
            isSuccess === true ? 'text-green-600' : isSuccess === false ? 'text-red-600' : 'text-gray-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

// Add React import at top if needed
import * as React from 'react';


import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

admin.initializeApp();

type Permission =
  | "CREATE_DATALOGGER"
  | "EDIT_DATALOGGER"
  | "DELETE_DATALOGGER"
  | "ASSIGN_USAGE"
  | "CLOSE_USAGE"
  | "EDIT_CALIBRATION"
  | "VIEW_AUDIT";

type User = {
  id: string;
  email: string;
  username: string; // Add username field
  role: "ADMIN" | "USER";
  pinCode: string; // hashed
  permissions: Permission[];
  active: boolean;
  createdAt: string;
};

type Datalogger = {
  id: string;
  name: string;
  type: "ATEX" | "NON_ATEX";
  measurementType: "TEMPERATURE" | "TEMP_HUMIDITY";
  calibrationPeriodMonths: number;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  status: "AVAILABLE" | "IN_USE" | "OUT_OF_SERVICE";
  createdAt: string;
  updatedAt: string;
};

type Usage = {
  id: string;
  dataloggerId: string;
  usageType:
    | "CYCLE_VALIDATION"
    | "SUIVI_LOCAL"
    | "CARTOGRAPHIE"
    | "EXPORT"
    | "FABRICATION_WC"
    | "AUTRE";
  startDate: string;
  endDate?: string;
  location: string;
  projectRef?: string;
  comments?: string;
};

type AuditLog = {
  id: string;
  userId: string;
  userRole: string;
  permissionUsed: Permission;
  action: string;
  entity: "DATALOGGER" | "USAGE" | "CALIBRATION" | "USER";
  entityId: string;
  timestamp: string;
  oldValue?: any;
  newValue?: any;
  comment?: string;
};

const hashPin = (pin: string) => crypto.createHash('sha256').update(pin).digest('hex');

const verifyPin = async (userId: string, enteredPin: string): Promise<boolean> => {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  if (!userDoc.exists) return false;
  const user = userDoc.data() as User;
  return user.pinCode === hashPin(enteredPin);
};

const logAudit = async (
  userId: string,
  userRole: string,
  permission: Permission,
  action: string,
  entity: "DATALOGGER" | "USAGE" | "CALIBRATION" | "USER",
  entityId: string,
  oldValue?: any,
  newValue?: any,
  comment?: string
) => {
  const audit: AuditLog = {
    id: admin.firestore().collection('auditLogs').doc().id,
    userId,
    userRole,
    permissionUsed: permission,
    action,
    entity,
    entityId,
    timestamp: new Date().toISOString(),
    oldValue,
    newValue,
    comment,
  };
  await admin.firestore().collection('auditLogs').doc(audit.id).set(audit);
};

export const createDatalogger = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  const userId = context.auth.uid;
  const { name, type, measurementType, calibrationPeriodMonths, pin } = data;

  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User not found');
  const user = userDoc.data() as User;
  if (!user.permissions.includes('CREATE_DATALOGGER')) throw new functions.https.HttpsError('permission-denied', 'Permission denied');

  const isValidPin = await verifyPin(userId, pin);
  if (!isValidPin) throw new functions.https.HttpsError('invalid-argument', 'Invalid PIN');

  const datalogger: Datalogger = {
    id: admin.firestore().collection('dataloggers').doc().id,
    name,
    type,
    measurementType,
    calibrationPeriodMonths,
    lastCalibrationDate: new Date().toISOString(),
    nextCalibrationDate: new Date(Date.now() + calibrationPeriodMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await admin.firestore().collection('dataloggers').doc(datalogger.id).set(datalogger);
  await logAudit(userId, user.role, 'CREATE_DATALOGGER', 'CREATE', 'DATALOGGER', datalogger.id, undefined, datalogger);
  return { success: true, datalogger };
});

export const updateDatalogger = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  const userId = context.auth.uid;
  const { id, updates, pin } = data;

  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User not found');
  const user = userDoc.data() as User;
  if (!user.permissions.includes('EDIT_DATALOGGER')) throw new functions.https.HttpsError('permission-denied', 'Permission denied');

  const isValidPin = await verifyPin(userId, pin);
  if (!isValidPin) throw new functions.https.HttpsError('invalid-argument', 'Invalid PIN');

  const dataloggerDoc = await admin.firestore().collection('dataloggers').doc(id).get();
  if (!dataloggerDoc.exists) throw new functions.https.HttpsError('not-found', 'Datalogger not found');
  const oldDatalogger = dataloggerDoc.data() as Datalogger;

  const newDatalogger = { ...oldDatalogger, ...updates, updatedAt: new Date().toISOString() };
  await admin.firestore().collection('dataloggers').doc(id).update(newDatalogger);
  await logAudit(userId, user.role, 'EDIT_DATALOGGER', 'UPDATE', 'DATALOGGER', id, oldDatalogger, newDatalogger);
  return { success: true, datalogger: newDatalogger };
});

export const deleteDatalogger = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  const userId = context.auth.uid;
  const { id, pin } = data;

  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User not found');
  const user = userDoc.data() as User;
  if (!user.permissions.includes('DELETE_DATALOGGER')) throw new functions.https.HttpsError('permission-denied', 'Permission denied');

  const isValidPin = await verifyPin(userId, pin);
  if (!isValidPin) throw new functions.https.HttpsError('invalid-argument', 'Invalid PIN');

  const dataloggerDoc = await admin.firestore().collection('dataloggers').doc(id).get();
  if (!dataloggerDoc.exists) throw new functions.https.HttpsError('not-found', 'Datalogger not found');
  const oldDatalogger = dataloggerDoc.data() as Datalogger;

  await admin.firestore().collection('dataloggers').doc(id).delete();
  await logAudit(userId, user.role, 'DELETE_DATALOGGER', 'DELETE', 'DATALOGGER', id, oldDatalogger, undefined);
  return { success: true };
});

export const assignUsage = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  const userId = context.auth.uid;
  const { dataloggerId, usageType, location, projectRef, comments, pin } = data;

  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User not found');
  const user = userDoc.data() as User;
  if (!user.permissions.includes('ASSIGN_USAGE')) throw new functions.https.HttpsError('permission-denied', 'Permission denied');

  const isValidPin = await verifyPin(userId, pin);
  if (!isValidPin) throw new functions.https.HttpsError('invalid-argument', 'Invalid PIN');

  const dataloggerDoc = await admin.firestore().collection('dataloggers').doc(dataloggerId).get();
  if (!dataloggerDoc.exists) throw new functions.https.HttpsError('not-found', 'Datalogger not found');
  const datalogger = dataloggerDoc.data() as Datalogger;
  if (datalogger.status !== 'AVAILABLE') throw new functions.https.HttpsError('failed-precondition', 'Datalogger not available');

  const usage: Usage = {
    id: admin.firestore().collection('usages').doc().id,
    dataloggerId,
    usageType,
    startDate: new Date().toISOString(),
    location,
    projectRef,
    comments,
  };

  await admin.firestore().collection('usages').doc(usage.id).set(usage);
  await admin.firestore().collection('dataloggers').doc(dataloggerId).update({ status: 'IN_USE' });
  await logAudit(userId, user.role, 'ASSIGN_USAGE', 'ASSIGN', 'USAGE', usage.id, undefined, usage);
  return { success: true, usage };
});

export const closeUsage = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  const userId = context.auth.uid;
  const { usageId, pin } = data;

  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User not found');
  const user = userDoc.data() as User;
  if (!user.permissions.includes('CLOSE_USAGE')) throw new functions.https.HttpsError('permission-denied', 'Permission denied');

  const isValidPin = await verifyPin(userId, pin);
  if (!isValidPin) throw new functions.https.HttpsError('invalid-argument', 'Invalid PIN');

  const usageDoc = await admin.firestore().collection('usages').doc(usageId).get();
  if (!usageDoc.exists) throw new functions.https.HttpsError('not-found', 'Usage not found');
  const usage = usageDoc.data() as Usage;

  const updatedUsage = { ...usage, endDate: new Date().toISOString() };
  await admin.firestore().collection('usages').doc(usageId).update(updatedUsage);
  await admin.firestore().collection('dataloggers').doc(usage.dataloggerId).update({ status: 'AVAILABLE' });
  await logAudit(userId, user.role, 'CLOSE_USAGE', 'CLOSE', 'USAGE', usageId, usage, updatedUsage);
  return { success: true, usage: updatedUsage };
});

export const updateCalibration = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  const userId = context.auth.uid;
  const { dataloggerId, lastCalibrationDate, pin } = data;

  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User not found');
  const user = userDoc.data() as User;
  if (!user.permissions.includes('EDIT_CALIBRATION')) throw new functions.https.HttpsError('permission-denied', 'Permission denied');

  const isValidPin = await verifyPin(userId, pin);
  if (!isValidPin) throw new functions.https.HttpsError('invalid-argument', 'Invalid PIN');

  const dataloggerDoc = await admin.firestore().collection('dataloggers').doc(dataloggerId).get();
  if (!dataloggerDoc.exists) throw new functions.https.HttpsError('not-found', 'Datalogger not found');
  const oldDatalogger = dataloggerDoc.data() as Datalogger;

  const nextCalibrationDate = new Date(new Date(lastCalibrationDate).getTime() + oldDatalogger.calibrationPeriodMonths * 30 * 24 * 60 * 60 * 1000).toISOString();
  const newDatalogger = { ...oldDatalogger, lastCalibrationDate, nextCalibrationDate, updatedAt: new Date().toISOString() };
  await admin.firestore().collection('dataloggers').doc(dataloggerId).update(newDatalogger);
  await logAudit(userId, user.role, 'EDIT_CALIBRATION', 'UPDATE', 'CALIBRATION', dataloggerId, oldDatalogger, newDatalogger);
  return { success: true, datalogger: newDatalogger };
});

export const createUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  const creatorId = context.auth.uid;
  const { email, password, username, role, pinCode, permissions, pin } = data;

  const creatorDoc = await admin.firestore().collection('users').doc(creatorId).get();
  if (!creatorDoc.exists) throw new functions.https.HttpsError('not-found', 'Creator not found');
  const creator = creatorDoc.data() as User;
  if (creator.role !== 'ADMIN') throw new functions.https.HttpsError('permission-denied', 'Only ADMIN can create users');

  const isValidPin = await verifyPin(creatorId, pin);
  if (!isValidPin) throw new functions.https.HttpsError('invalid-argument', 'Invalid PIN');

  const userRecord = await admin.auth().createUser({ email, password });
  const user: User = {
    id: userRecord.uid,
    email,
    username, // Add username field
    role,
    pinCode: hashPin(pinCode),
    permissions,
    active: true,
    createdAt: new Date().toISOString(),
  };
  await admin.firestore().collection('users').doc(user.id).set(user);
  await logAudit(creatorId, creator.role, 'CREATE_DATALOGGER', 'CREATE', 'USER', user.id, undefined, user); // assume permission for user creation
  return { success: true, user };
});

export const updateUserPermissions = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  const updaterId = context.auth.uid;
  const { userId, permissions, pin } = data;

  const updaterDoc = await admin.firestore().collection('users').doc(updaterId).get();
  if (!updaterDoc.exists) throw new functions.https.HttpsError('not-found', 'Updater not found');
  const updater = updaterDoc.data() as User;
  if (updater.role !== 'ADMIN') throw new functions.https.HttpsError('permission-denied', 'Only ADMIN can update permissions');

  const isValidPin = await verifyPin(updaterId, pin);
  if (!isValidPin) throw new functions.https.HttpsError('invalid-argument', 'Invalid PIN');

  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User not found');
  const oldUser = userDoc.data() as User;

  const newUser = { ...oldUser, permissions };
  await admin.firestore().collection('users').doc(userId).update(newUser);
  await logAudit(updaterId, updater.role, 'CREATE_DATALOGGER', 'UPDATE', 'USER', userId, oldUser, newUser); // assume permission
  return { success: true, user: newUser };
});

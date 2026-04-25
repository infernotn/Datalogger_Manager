export type Permission =
  | "CREATE_DATALOGGER"
  | "EDIT_DATALOGGER"
  | "DELETE_DATALOGGER"
  | "ASSIGN_USAGE"
  | "CLOSE_USAGE"
  | "EDIT_CALIBRATION"
  | "VIEW_AUDIT";

export type User = {
  id: string;
  email: string;
  username: string; // Add username field
  role: "ADMIN" | "USER";
  pinCode: string; // hashed
  permissions: Permission[];
  active: boolean;
  createdAt: string;
};

export type Datalogger = {
  id: string;
  name: string; // EXX / EN
  type: "ATEX" | "NON_ATEX";
  measurementType: "TEMPERATURE" | "TEMP_HUMIDITY";
  calibrationPeriodMonths: number;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  status: "AVAILABLE" | "IN_USE" | "OUT_OF_SERVICE";
  createdAt: string;
  updatedAt: string;
};

export type Usage = {
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

export type AuditLog = {
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

// utils/constants.js
export const PATIENT_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const PRIORITY_LEVELS = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

export const MODALITIES = {
  CT: "CT",
  MRI: "MRI",
  XRAY: "X-Ray",
  US: "US",
  NM: "NM",
  PET: "PET",
  MAMMO: "MG",
  FLUORO: "XA",
};

export const BODY_PARTS = {
  HEAD: "Head",
  NECK: "Neck",
  CHEST: "Chest",
  ABDOMEN: "Abdomen",
  PELVIS: "Pelvis",
  SPINE: "Spine",
  EXTREMITY: "Extremity",
  HEART: "Heart",
  BRAIN: "Brain",
};

export const REPORT_STATUS = {
  DRAFT: "draft",
  PRELIMINARY: "preliminary",
  FINAL: "final",
  AMENDED: "amended",
};

export const USER_ROLES = {
  RADIOLOGIST: "radiologist",
  RESIDENT: "resident",
  TECHNOLOGIST: "technologist",
  ADMIN: "admin",
};

export const DICOM_TAGS = {
  PATIENT_NAME: "00100010",
  PATIENT_ID: "00100020",
  PATIENT_BIRTH_DATE: "00100030",
  PATIENT_SEX: "00100040",
  STUDY_INSTANCE_UID: "0020000D",
  SERIES_INSTANCE_UID: "0020000E",
  SOP_INSTANCE_UID: "00080018",
  MODALITY: "00080060",
  STUDY_DATE: "00080020",
  STUDY_TIME: "00080030",
  ACCESSION_NUMBER: "00080050",
  STUDY_DESCRIPTION: "00081030",
  SERIES_DESCRIPTION: "0008103E",
  INSTANCE_NUMBER: "00200013",
  SERIES_NUMBER: "00200011",
  ROWS: "00280010",
  COLUMNS: "00280011",
  PIXEL_SPACING: "00280030",
  SLICE_THICKNESS: "00180050",
  WINDOW_CENTER: "00281050",
  WINDOW_WIDTH: "00281051",
};

export const IMAGE_TOOLS = {
  PAN: "pan",
  ZOOM: "zoom",
  WINDOWING: "windowing",
  MEASUREMENT: "measurement",
  ANGLE: "angle",
  RECTANGLE: "rectangle",
  ELLIPSE: "ellipse",
  ARROW: "arrow",
  TEXT: "text",
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
  },
  PATIENTS: {
    LIST: "/patients",
    DETAILS: "/patients/:id",
    STUDIES: "/patients/:id/studies",
  },
  DICOM: {
    SEARCH: "/dicom/studies",
    STUDY: "/dicom/studies/:studyId",
    SERIES: "/dicom/studies/:studyId/series",
    INSTANCES: "/dicom/studies/:studyId/series/:seriesId/instances",
    IMAGE: "/dicom/studies/:studyId/series/:seriesId/instances/:instanceId",
  },
  REPORTS: {
    LIST: "/reports",
    CREATE: "/reports",
    UPDATE: "/reports/:id",
    DELETE: "/reports/:id",
  },
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Network connection error. Please check your internet connection.",
  UNAUTHORIZED: "You are not authorized to access this resource.",
  FORBIDDEN: "Access to this resource is forbidden.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Internal server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  UNKNOWN_ERROR: "An unknown error occurred. Please try again.",
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "teleradiology_token",
  REFRESH_TOKEN: "teleradiology_refresh_token",
  USER_DATA: "teleradiology_user",
  PREFERENCES: "teleradiology_preferences",
  RECENT_PATIENTS: "teleradiology_recent_patients",
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
};

export const FILE_TYPES = {
  DICOM: "application/dicom",
  PDF: "application/pdf",
  IMAGE: "image/*",
  JSON: "application/json",
};

// utils/dateUtils.js
import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";

export const dateUtils = {
  // Format date for display
  formatDate: (date, formatString = "MMM dd, yyyy") => {
    if (!date) return "";

    try {
      const dateObj = typeof date === "string" ? parseISO(date) : date;
      if (!isValid(dateObj)) return "";
      return format(dateObj, formatString);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  },

  // Format date and time
  formatDateTime: (date, formatString = "MMM dd, yyyy HH:mm") => {
    if (!date) return "";

    try {
      const dateObj = typeof date === "string" ? parseISO(date) : date;
      if (!isValid(dateObj)) return "";
      return format(dateObj, formatString);
    } catch (error) {
      console.error("DateTime formatting error:", error);
      return "";
    }
  },

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime: (date) => {
    if (!date) return "";

    try {
      const dateObj = typeof date === "string" ? parseISO(date) : date;
      if (!isValid(dateObj)) return "";
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      console.error("Relative time formatting error:", error);
      return "";
    }
  },

  // Format DICOM date (YYYYMMDD) to readable format
  formatDicomDate: (dicomDate) => {
    if (!dicomDate || dicomDate.length !== 8) return "";

    try {
      const year = dicomDate.substring(0, 4);
      const month = dicomDate.substring(4, 6);
      const day = dicomDate.substring(6, 8);
      const dateObj = new Date(year, month - 1, day);

      if (!isValid(dateObj)) return "";
      return format(dateObj, "MMM dd, yyyy");
    } catch (error) {
      console.error("DICOM date formatting error:", error);
      return "";
    }
  },

  // Format DICOM time (HHMMSS) to readable format
  formatDicomTime: (dicomTime) => {
    if (!dicomTime || dicomTime.length < 4) return "";

    try {
      const hours = dicomTime.substring(0, 2);
      const minutes = dicomTime.substring(2, 4);
      const seconds = dicomTime.length >= 6 ? dicomTime.substring(4, 6) : "00";

      return `${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error("DICOM time formatting error:", error);
      return "";
    }
  },

  // Get age from birth date
  calculateAge: (birthDate) => {
    if (!birthDate) return "";

    try {
      const birth =
        typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
      if (!isValid(birth)) return "";

      const today = new Date();
      const years = Math.floor(
        (today - birth) / (365.25 * 24 * 60 * 60 * 1000)
      );

      return years;
    } catch (error) {
      console.error("Age calculation error:", error);
      return "";
    }
  },

  // Check if date is today
  isToday: (date) => {
    if (!date) return false;

    try {
      const dateObj = typeof date === "string" ? parseISO(date) : date;
      if (!isValid(dateObj)) return false;

      const today = new Date();
      return differenceInDays(today, dateObj) === 0;
    } catch (error) {
      return false;
    }
  },

  // Get time difference in human readable format
  getTimeDifference: (date1, date2 = new Date()) => {
    if (!date1) return "";

    try {
      const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
      const d2 = typeof date2 === "string" ? parseISO(date2) : date2;

      if (!isValid(d1) || !isValid(d2)) return "";

      const days = Math.abs(differenceInDays(d2, d1));
      const hours = Math.abs(differenceInHours(d2, d1));
      const minutes = Math.abs(differenceInMinutes(d2, d1));

      if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
      if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
      return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    } catch (error) {
      console.error("Time difference calculation error:", error);
      return "";
    }
  },

  // Convert to ISO string for API
  toISOString: (date) => {
    if (!date) return null;

    try {
      const dateObj = typeof date === "string" ? parseISO(date) : date;
      if (!isValid(dateObj)) return null;
      return dateObj.toISOString();
    } catch (error) {
      console.error("ISO string conversion error:", error);
      return null;
    }
  },

  // Parse various date formats
  parseDate: (dateString) => {
    if (!dateString) return null;

    try {
      // Try ISO format first
      let parsed = parseISO(dateString);
      if (isValid(parsed)) return parsed;

      // Try DICOM date format (YYYYMMDD)
      if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        parsed = new Date(year, month - 1, day);
        if (isValid(parsed)) return parsed;
      }

      // Try standard Date constructor
      parsed = new Date(dateString);
      if (isValid(parsed)) return parsed;

      return null;
    } catch (error) {
      console.error("Date parsing error:", error);
      return null;
    }
  },
};

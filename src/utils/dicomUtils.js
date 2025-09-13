/ utils/dicomUtils.js
export const dicomUtils = {
  // Parse DICOM patient name (Last^First^Middle)
  parsePatientName: (patientName) => {
    if (!patientName) return { fullName: '', lastName: '', firstName: '', middleName: '' };
    
    const parts = patientName.split('^');
    const lastName = parts[0] || '';
    const firstName = parts[1] || '';
    const middleName = parts[2] || '';
    
    const fullName = [firstName, middleName, lastName]
      .filter(part => part.trim())
      .join(' ');
    
    return {
      fullName,
      lastName,
      firstName,
      middleName
    };
  },

  // Format patient name for display
  formatPatientName: (patientName) => {
    const parsed = dicomUtils.parsePatientName(patientName);
    return parsed.fullName;
  },

  // Parse pixel spacing
  parsePixelSpacing: (pixelSpacing) => {
    if (!pixelSpacing) return { row: 1, column: 1 };
    
    if (Array.isArray(pixelSpacing)) {
      return {
        row: parseFloat(pixelSpacing[0]) || 1,
        column: parseFloat(pixelSpacing[1]) || 1
      };
    }
    
    if (typeof pixelSpacing === 'string') {
      const parts = pixelSpacing.split('\\');
      return {
        row: parseFloat(parts[0]) || 1,
        column: parseFloat(parts[1]) || parts[0] || 1
      };
    }
    
    return { row: 1, column: 1 };
  },

  // Calculate image dimensions in mm
  getImageDimensions: (rows, columns, pixelSpacing) => {
    const spacing = dicomUtils.parsePixelSpacing(pixelSpacing);
    return {
      width: columns * spacing.column,
      height: rows * spacing.row,
      widthMM: Math.round(columns * spacing.column * 100) / 100,
      heightMM: Math.round(rows * spacing.row * 100) / 100
    };
  },

  // Calculate distance between two points in mm
  calculateDistance: (point1, point2, pixelSpacing) => {
    const spacing = dicomUtils.parsePixelSpacing(pixelSpacing);
    const dx = (point2.x - point1.x) * spacing.column;
    const dy = (point2.y - point1.y) * spacing.row;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Format measurement for display
  formatMeasurement: (measurement, unit = 'mm', precision = 2) => {
    if (typeof measurement !== 'number' || isNaN(measurement)) return '';
    return `${measurement.toFixed(precision)} ${unit}`;
  },

  // Validate DICOM UID
  isValidDicomUID: (uid) => {
    if (!uid || typeof uid !== 'string') return false;
    
    // DICOM UIDs should contain only digits and dots
    const uidPattern = /^[0-9.]+$/;
    if (!uidPattern.test(uid)) return false;
    
    // Should not start or end with a dot
    if (uid.startsWith('.') || uid.endsWith('.')) return false;
    
    // Should not have consecutive dots
    if (uid.includes('..')) return false;
    
    // Maximum length is 64 characters
    if (uid.length > 64) return false;
    
    return true;
  },

  // Get modality description
  getModalityDescription: (modality) => {
    const descriptions = {
      'CT': 'Computed Tomography',
      'MRI': 'Magnetic Resonance Imaging',
      'MR': 'Magnetic Resonance Imaging',
      'XR': 'X-Ray Radiography',
      'DX': 'Digital Radiography',
      'CR': 'Computed Radiography',
      'US': 'Ultrasound',
      'NM': 'Nuclear Medicine',
      'PT': 'Positron Emission Tomography',
      'PET': 'Positron Emission Tomography',
      'MG': 'Mammography',
      'XA': 'X-Ray Angiography',
      'RF': 'Radiofluoroscopy',
      'SC': 'Secondary Capture',
      'OT': 'Other'
    };
    
    return descriptions[modality] || modality;
  },

  // Convert DICOM date to Date object
  dicomDateToDate: (dicomDate, dicomTime = null) => {
    if (!dicomDate || dicomDate.length !== 8) return null;
    
    try {
      const year = parseInt(dicomDate.substring(0, 4));
      const month = parseInt(dicomDate.substring(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(dicomDate.substring(6, 8));
      
      let hours = 0, minutes = 0, seconds = 0;
      
      if (dicomTime && dicomTime.length >= 6) {
        hours = parseInt(dicomTime.substring(0, 2));
        minutes = parseInt(dicomTime.substring(2, 4));
        seconds = parseInt(dicomTime.substring(4, 6));
      }
      
      return new Date(year, month, day, hours, minutes, seconds);
    } catch (error) {
      console.error('DICOM date conversion error:', error);
      return null;
    }
  },

  // Generate DICOM-compatible UID
  generateUID: (prefix = '1.2.840.114350') => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${prefix}.${timestamp}.${random}`;
  },

  // Parse DICOM tag
  parseTag: (tag) => {
    if (!tag || typeof tag !== 'string') return null;
    
    // Remove any non-hexadecimal characters
    const cleanTag = tag.replace(/[^0-9A-Fa-f]/g, '');
    
    if (cleanTag.length !== 8) return null;
    
    return {
      group: cleanTag.substring(0, 4).toUpperCase(),
      element: cleanTag.substring(4, 8).toUpperCase(),
      formatted: `(${cleanTag.substring(0, 4)},${cleanTag.substring(4, 8)})`.toUpperCase()
    };
  }
};
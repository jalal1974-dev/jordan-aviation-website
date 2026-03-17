/**
 * Automated Document Validation Service
 * Performs pre-verification checks on uploaded documents
 * Flags suspicious documents before admin review
 */

export interface ValidationResult {
  isValid: boolean;
  flags: ValidationFlag[];
  riskScore: number; // 0-100
  recommendations: string[];
}

export interface ValidationFlag {
  type: "error" | "warning" | "info";
  code: string;
  message: string;
  severity: "low" | "medium" | "high";
}

/**
 * Validation error codes
 */
export const VALIDATION_CODES = {
  // File errors
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  FILE_TOO_SMALL: "FILE_TOO_SMALL",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  CORRUPTED_FILE: "CORRUPTED_FILE",

  // Image quality errors
  IMAGE_TOO_DARK: "IMAGE_TOO_DARK",
  IMAGE_TOO_BRIGHT: "IMAGE_TOO_BRIGHT",
  IMAGE_BLURRY: "IMAGE_BLURRY",
  IMAGE_LOW_RESOLUTION: "IMAGE_LOW_RESOLUTION",

  // Document content errors
  DOCUMENT_EXPIRED: "DOCUMENT_EXPIRED",
  DOCUMENT_INVALID_FORMAT: "DOCUMENT_INVALID_FORMAT",
  TEXT_NOT_READABLE: "TEXT_NOT_READABLE",

  // Suspicious patterns
  DUPLICATE_SUBMISSION: "DUPLICATE_SUBMISSION",
  SIMILAR_TO_REJECTED: "SIMILAR_TO_REJECTED",
  UNUSUAL_METADATA: "UNUSUAL_METADATA",
};

/**
 * File size constraints (in bytes)
 */
const FILE_CONSTRAINTS = {
  MIN_SIZE: 50 * 1024, // 50 KB
  MAX_SIZE: 10 * 1024 * 1024, // 10 MB
};

/**
 * Allowed file types
 */
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Validate file size
 */
function validateFileSize(fileSize: number): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  if (fileSize < FILE_CONSTRAINTS.MIN_SIZE) {
    flags.push({
      type: "error",
      code: VALIDATION_CODES.FILE_TOO_SMALL,
      message: `File size (${(fileSize / 1024).toFixed(2)} KB) is below minimum (${(FILE_CONSTRAINTS.MIN_SIZE / 1024).toFixed(0)} KB)`,
      severity: "high",
    });
  }

  if (fileSize > FILE_CONSTRAINTS.MAX_SIZE) {
    flags.push({
      type: "error",
      code: VALIDATION_CODES.FILE_TOO_LARGE,
      message: `File size (${(fileSize / 1024 / 1024).toFixed(2)} MB) exceeds maximum (${(FILE_CONSTRAINTS.MAX_SIZE / 1024 / 1024).toFixed(0)} MB)`,
      severity: "high",
    });
  }

  return flags;
}

/**
 * Validate file type
 */
function validateFileType(mimeType: string): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    flags.push({
      type: "error",
      code: VALIDATION_CODES.INVALID_FILE_TYPE,
      message: `File type "${mimeType}" is not allowed. Supported types: PDF, JPEG, PNG, WebP, DOC, DOCX`,
      severity: "high",
    });
  }

  return flags;
}

/**
 * Validate image quality (simulated)
 * In production, would use image processing library
 */
function validateImageQuality(
  mimeType: string,
  metadata?: Record<string, any>
): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  if (!mimeType.startsWith("image/")) {
    return flags;
  }

  // Check resolution
  if (metadata?.width && metadata?.height) {
    const megapixels = (metadata.width * metadata.height) / 1000000;
    if (megapixels < 1) {
      flags.push({
        type: "warning",
        code: VALIDATION_CODES.IMAGE_LOW_RESOLUTION,
        message: `Image resolution (${metadata.width}x${metadata.height}) is low. Recommended: at least 1200x1600 pixels`,
        severity: "medium",
      });
    }
  }

  // Check for common quality issues (simulated)
  if (metadata?.brightness !== undefined) {
    if (metadata.brightness < 30) {
      flags.push({
        type: "warning",
        code: VALIDATION_CODES.IMAGE_TOO_DARK,
        message: "Image appears too dark. Ensure adequate lighting for better readability",
        severity: "medium",
      });
    }
    if (metadata.brightness > 250) {
      flags.push({
        type: "warning",
        code: VALIDATION_CODES.IMAGE_TOO_BRIGHT,
        message: "Image appears overexposed. Reduce brightness for better document visibility",
        severity: "medium",
      });
    }
  }

  // Check for blur (simulated)
  if (metadata?.blurScore !== undefined && metadata.blurScore > 0.7) {
    flags.push({
      type: "warning",
      code: VALIDATION_CODES.IMAGE_BLURRY,
      message: "Image may be blurry. Please ensure document is in focus",
      severity: "high",
    });
  }

  return flags;
}

/**
 * Validate document expiration
 */
function validateDocumentExpiration(
  expirationDate?: Date
): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  if (!expirationDate) {
    return flags;
  }

  const now = new Date();
  const daysUntilExpiry = Math.floor(
    (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) {
    flags.push({
      type: "error",
      code: VALIDATION_CODES.DOCUMENT_EXPIRED,
      message: `Document expired on ${expirationDate.toLocaleDateString()}`,
      severity: "high",
    });
  } else if (daysUntilExpiry < 90) {
    flags.push({
      type: "warning",
      code: VALIDATION_CODES.DOCUMENT_EXPIRED,
      message: `Document expires in ${daysUntilExpiry} days (${expirationDate.toLocaleDateString()})`,
      severity: "medium",
    });
  }

  return flags;
}

/**
 * Validate document metadata
 */
function validateMetadata(metadata?: Record<string, any>): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  if (!metadata) {
    return flags;
  }

  // Check for unusual metadata patterns
  if (metadata.modificationCount && metadata.modificationCount > 5) {
    flags.push({
      type: "warning",
      code: VALIDATION_CODES.UNUSUAL_METADATA,
      message: `Document has been modified ${metadata.modificationCount} times. Ensure authenticity`,
      severity: "medium",
    });
  }

  // Check for suspicious creation date
  if (metadata.createdDate) {
    const createdDate = new Date(metadata.createdDate);
    const now = new Date();
    const daysSinceCreation = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation > 365 * 5) {
      flags.push({
        type: "info",
        code: VALIDATION_CODES.UNUSUAL_METADATA,
        message: `Document was created ${daysSinceCreation} days ago. Verify it's still valid`,
        severity: "low",
      });
    }
  }

  return flags;
}

/**
 * Calculate risk score based on flags
 */
function calculateRiskScore(flags: ValidationFlag[]): number {
  let score = 0;

  for (const flag of flags) {
    if (flag.type === "error") {
      score += flag.severity === "high" ? 30 : flag.severity === "medium" ? 20 : 10;
    } else if (flag.type === "warning") {
      score += flag.severity === "high" ? 15 : flag.severity === "medium" ? 10 : 5;
    } else if (flag.type === "info") {
      score += 2;
    }
  }

  return Math.min(score, 100);
}

/**
 * Generate recommendations based on flags
 */
function generateRecommendations(flags: ValidationFlag[]): string[] {
  const recommendations: string[] = [];

  // Group flags by code
  const flagsByCode = new Map<string, ValidationFlag[]>();
  for (const flag of flags) {
    if (!flagsByCode.has(flag.code)) {
      flagsByCode.set(flag.code, []);
    }
    flagsByCode.get(flag.code)!.push(flag);
  }

  // Generate recommendations
  if (flagsByCode.has(VALIDATION_CODES.FILE_TOO_LARGE)) {
    recommendations.push("Compress the file or upload a smaller version");
  }

  if (flagsByCode.has(VALIDATION_CODES.IMAGE_TOO_DARK)) {
    recommendations.push("Re-photograph the document in better lighting conditions");
  }

  if (flagsByCode.has(VALIDATION_CODES.IMAGE_TOO_BRIGHT)) {
    recommendations.push("Adjust camera settings to reduce overexposure");
  }

  if (flagsByCode.has(VALIDATION_CODES.IMAGE_BLURRY)) {
    recommendations.push("Ensure the document is in focus before taking the photo");
  }

  if (flagsByCode.has(VALIDATION_CODES.IMAGE_LOW_RESOLUTION)) {
    recommendations.push("Use a higher resolution camera or scanner");
  }

  if (flagsByCode.has(VALIDATION_CODES.DOCUMENT_EXPIRED)) {
    recommendations.push("Renew your document before uploading");
  }

  if (flagsByCode.has(VALIDATION_CODES.TEXT_NOT_READABLE)) {
    recommendations.push("Ensure all text on the document is clearly visible and readable");
  }

  return recommendations;
}

/**
 * Main validation function
 */
export async function validateDocument(
  fileSize: number,
  mimeType: string,
  fileName: string,
  metadata?: Record<string, any>
): Promise<ValidationResult> {
  const flags: ValidationFlag[] = [];

  // Run all validation checks
  flags.push(...validateFileSize(fileSize));
  flags.push(...validateFileType(mimeType));
  flags.push(...validateImageQuality(mimeType, metadata));
  flags.push(...validateDocumentExpiration(metadata?.expirationDate));
  flags.push(...validateMetadata(metadata));

  // Determine if document is valid (no errors)
  const hasErrors = flags.some((f) => f.type === "error");
  const isValid = !hasErrors;

  // Calculate risk score
  const riskScore = calculateRiskScore(flags);

  // Generate recommendations
  const recommendations = generateRecommendations(flags);

  return {
    isValid,
    flags,
    riskScore,
    recommendations,
  };
}

/**
 * Quick validation for file upload
 * Returns true if file passes basic checks
 */
export function quickValidateFile(
  fileSize: number,
  mimeType: string
): { valid: boolean; error?: string } {
  if (fileSize < FILE_CONSTRAINTS.MIN_SIZE) {
    return {
      valid: false,
      error: `File too small (minimum ${(FILE_CONSTRAINTS.MIN_SIZE / 1024).toFixed(0)} KB)`,
    };
  }

  if (fileSize > FILE_CONSTRAINTS.MAX_SIZE) {
    return {
      valid: false,
      error: `File too large (maximum ${(FILE_CONSTRAINTS.MAX_SIZE / 1024 / 1024).toFixed(0)} MB)`,
    };
  }

  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: "File type not supported",
    };
  }

  return { valid: true };
}

/**
 * Get validation status badge
 */
export function getValidationStatusBadge(riskScore: number): {
  status: "safe" | "warning" | "danger";
  label: string;
} {
  if (riskScore < 20) {
    return { status: "safe", label: "Safe" };
  } else if (riskScore < 50) {
    return { status: "warning", label: "Review Recommended" };
  } else {
    return { status: "danger", label: "High Risk" };
  }
}

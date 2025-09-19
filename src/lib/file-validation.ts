// Enhanced file validation and sanitization
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFile?: File;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  scanForMalware?: boolean; // Placeholder for future implementation
}

const DEFAULT_OPTIONS: Required<FileValidationOptions> = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'],
  scanForMalware: false,
};

export class FileValidator {
  private options: Required<FileValidationOptions>;

  constructor(options: FileValidationOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async validateFile(file: File): Promise<FileValidationResult> {
    try {
      // 1. Check file size
      if (file.size > this.options.maxSizeBytes) {
        return {
          isValid: false,
          error: `File size exceeds limit. Maximum allowed: ${this.formatBytes(this.options.maxSizeBytes)}`,
        };
      }

      // 2. Check file type
      if (!this.options.allowedTypes.includes(file.type)) {
        return {
          isValid: false,
          error: `Unsupported file type: ${file.type}. Allowed types: ${this.options.allowedTypes.join(', ')}`,
        };
      }

      // 3. Check file extension
      const extension = this.getFileExtension(file.name);
      if (!this.options.allowedExtensions.includes(extension.toLowerCase())) {
        return {
          isValid: false,
          error: `Unsupported file extension: ${extension}. Allowed extensions: ${this.options.allowedExtensions.join(', ')}`,
        };
      }

      // 4. Validate file name (sanitize)
      const sanitizedName = this.sanitizeFileName(file.name);
      if (sanitizedName !== file.name) {
        // Create a new file with sanitized name
        const sanitizedFile = new File([file], sanitizedName, { type: file.type });
        return {
          isValid: true,
          sanitizedFile,
        };
      }

      // 5. Additional security checks
      const securityCheck = await this.performSecurityChecks(file);
      if (!securityCheck.isValid) {
        return securityCheck;
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: `File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  private sanitizeFileName(filename: string): string {
    // Remove or replace potentially dangerous characters
    return filename
      .replace(/[<>:"/\\|?*]/g, '_') // Replace dangerous characters with underscore
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 255); // Limit filename length
  }

  private async performSecurityChecks(file: File): Promise<FileValidationResult> {
    // Check for suspicious file patterns
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.pif$/i,
      /\.com$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.jar$/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        return {
          isValid: false,
          error: 'File type not allowed for security reasons',
        };
      }
    }

    // Check file header for PDF files
    if (file.type === 'application/pdf') {
      const isValidPdf = await this.validatePdfHeader(file);
      if (!isValidPdf) {
        return {
          isValid: false,
          error: 'Invalid PDF file format',
        };
      }
    }

    return { isValid: true };
  }

  private async validatePdfHeader(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4));
        const header = String.fromCharCode(...uint8Array);
        resolve(header === '%PDF');
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Default validator instance
export const fileValidator = new FileValidator();

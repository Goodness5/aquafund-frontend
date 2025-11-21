/**
 * Utility functions for handling base64 images
 */

/**
 * Convert base64 string to Blob
 * @param base64 - Base64 string (with or without data URL prefix)
 * @param mimeType - MIME type (default: 'image/png')
 * @returns Blob object
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/png'): Blob {
  // Remove data URL prefix if present (e.g., "data:image/png;base64,")
  let base64Data = base64;
  let detectedMimeType = mimeType;

  if (base64.includes(',')) {
    const parts = base64.split(',');
    base64Data = parts[1];
    // Extract MIME type from data URL if available
    const mimeMatch = parts[0].match(/data:([^;]+)/);
    if (mimeMatch) {
      detectedMimeType = mimeMatch[1];
    }
  }

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: detectedMimeType });
}

/**
 * Convert base64 string to File object
 * @param base64 - Base64 string (with or without data URL prefix)
 * @param filename - Name for the file
 * @param mimeType - MIME type (default: 'image/png')
 * @returns File object
 */
export function base64ToFile(base64: string, filename: string, mimeType: string = 'image/png'): File {
  const blob = base64ToBlob(base64, mimeType);
  return new File([blob], filename, { type: blob.type });
}

/**
 * Check if a string is a valid base64 image
 * @param str - String to check
 * @returns true if string is a valid base64 image
 */
export function isBase64Image(str: string): boolean {
  // Check if it's a data URL
  if (str.startsWith('data:image/')) {
    return true;
  }
  // Check if it's a valid base64 string (basic check)
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(str) && str.length > 100; // Base64 images are typically long
}

/**
 * Get MIME type from base64 data URL
 * @param base64 - Base64 string with data URL prefix
 * @returns MIME type or 'image/png' as default
 */
export function getMimeTypeFromBase64(base64: string): string {
  if (base64.includes(',')) {
    const mimeMatch = base64.split(',')[0].match(/data:([^;]+)/);
    if (mimeMatch) {
      return mimeMatch[1];
    }
  }
  return 'image/png';
}

/**
 * Display base64 image directly in img tag
 * This is the simplest way - just use the base64 string as src
 * 
 * Example usage:
 * ```tsx
 * const imageSrc = ngoData.orgImages[0]; // Base64 string from backend
 * <img src={imageSrc} alt="NGO Logo" />
 * ```
 */


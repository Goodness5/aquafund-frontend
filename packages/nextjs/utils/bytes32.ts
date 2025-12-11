import { stringToBytes, pad, hexToBytes, bytesToHex, toHex } from "viem";

/**
 * Converts a string to bytes32 (exactly 32 bytes)
 * If string is longer than 32 bytes, it will throw an error
 * If string is shorter, it will be padded with zeros
 */
export function stringToBytes32(str: string): `0x${string}` {
  const bytes = stringToBytes(str);
  
  // Check if string is too long (bytes32 can only hold 32 bytes)
  if (bytes.length > 32) {
    throw new Error(`String "${str}" (${bytes.length} bytes) exceeds bytes32 size limit of 32 bytes`);
  }
  
  // Pad to exactly 32 bytes on the right with zeros
  // This ensures viem receives exactly bytes32 (32 bytes = 64 hex characters)
  const padded = pad(bytes, { size: 32, dir: 'right' });
  
  // Verify it's exactly 32 bytes
  if (padded.length !== 32) {
    throw new Error(`Padding failed: expected 32 bytes, got ${padded.length} bytes`);
  }
  
  // Use toHex with size parameter to ensure exactly bytes32 format
  // This tells viem this is exactly 32 bytes
  const hex = toHex(padded, { size: 32 });
  
  // Verify hex string is exactly 64 characters (32 bytes * 2)
  if (hex.length !== 66) { // 0x + 64 hex chars
    throw new Error(`Hex conversion failed: expected 66 characters (0x + 64 hex), got ${hex.length}`);
  }
  
  return hex as `0x${string}`;
}

/**
 * Converts bytes32 back to a string
 * Removes null bytes and trims whitespace
 */
export function bytes32ToString(bytes32: `0x${string}` | string | null | undefined): string {
  if (!bytes32 || bytes32 === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    return "N/A";
  }
  
  try {
    // Convert hex string to bytes
    const bytes = hexToBytes(bytes32 as `0x${string}`);
    // Convert bytes to string, removing null bytes
    const str = new TextDecoder("utf-8").decode(bytes).replace(/\0/g, "").trim();
    return str || "N/A";
  } catch (error) {
    console.error("Error converting bytes32 to string:", error);
    return "N/A";
  }
}

/**
 * Converts an array of bytes32 to an array of strings
 */
export function bytes32ArrayToStringArray(bytes32Array: (`0x${string}` | string)[] | null | undefined): string[] {
  if (!bytes32Array || bytes32Array.length === 0) {
    return [];
  }
  
  return bytes32Array.map(bytes32ToString).filter(str => str !== "N/A");
}


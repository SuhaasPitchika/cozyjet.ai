"use client";

/**
 * Encrypted Local Storage
 * 
 * Provides secure, encrypted storage for chat history and sensitive data
 * using the Web Crypto API (AES-GCM).
 * 
 * Security features:
 * - AES-256-GCM encryption
 * - Key derivation using PBKDF2
 * - Unique IV for each encryption
 * - Data authentication to prevent tampering
 */

const ENCRYPTION_ALGORITHM = "AES-GCM";
const KEY_DERIVATION = "PBKDF2";
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000;

// Storage keys
export const STORAGE_KEYS = {
  CHAT_HISTORY: "maxim_chat_history",
  USER_PREFERENCES: "maxim_user_prefs",
  ENCRYPTION_KEY: "maxim_encryption_key",
} as const;

/**
 * Generate a cryptographically secure random array
 */
function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Derive an encryption key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION,
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generate a device-specific password for key derivation
 * Uses multiple device identifiers for uniqueness
 */
function getDevicePassword(): string {
  // Create a device fingerprint from available info
  const deviceInfo = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join("|");
  
  // Simple hash to create a consistent password
  let hash = 0;
  for (let i = 0; i < deviceInfo.length; i++) {
    const char = deviceInfo.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `maxim_secure_${Math.abs(hash).toString(36)}`;
}

/**
 * Get or create the encryption key
 */
async function getOrCreateKey(): Promise<CryptoKey> {
  const storedKeyData = localStorage.getItem(STORAGE_KEYS.ENCRYPTION_KEY);
  
  if (storedKeyData) {
    const keyData = JSON.parse(storedKeyData);
    return crypto.subtle.importKey(
      "jwk",
      keyData,
      { name: ENCRYPTION_ALGORITHM, length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  
  // Generate new key
  const password = getDevicePassword();
  const salt = generateRandomBytes(SALT_LENGTH);
  const key = await deriveKey(password, salt);
  
  // Export and store key
  const exportedKey = await crypto.subtle.exportKey("jwk", key);
  localStorage.setItem(STORAGE_KEYS.ENCRYPTION_KEY, JSON.stringify(exportedKey));
  localStorage.setItem(`${STORAGE_KEYS.ENCRYPTION_KEY}_salt`, Array.from(salt).join(","));
  
  return key;
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(data: unknown): Promise<string> {
  const key = await getOrCreateKey();
  const iv = generateRandomBytes(IV_LENGTH);
  const encoder = new TextEncoder();
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    encoder.encode(JSON.stringify(data))
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData<T>(encryptedString: string): Promise<T | null> {
  try {
    const key = await getOrCreateKey();
    
    // Decode from base64
    const combined = new Uint8Array(
      atob(encryptedString).split("").map((c) => c.charCodeAt(0))
    );
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted)) as T;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

/**
 * Store encrypted data in localStorage
 */
export async function setSecureItem(key: string, data: unknown): Promise<void> {
  const encrypted = await encryptData(data);
  localStorage.setItem(key, encrypted);
}

/**
 * Retrieve and decrypt data from localStorage
 */
export async function getSecureItem<T>(key: string): Promise<T | null> {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  return decryptData<T>(encrypted);
}

/**
 * Remove item from secure storage
 */
export function removeSecureItem(key: string): void {
  localStorage.removeItem(key);
}

// Chat message type
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

/**
 * Save chat history securely
 */
export async function saveChatHistory(messages: ChatMessage[]): Promise<void> {
  await setSecureItem(STORAGE_KEYS.CHAT_HISTORY, messages);
}

/**
 * Load chat history securely
 */
export async function loadChatHistory(): Promise<ChatMessage[]> {
  const messages = await getSecureItem<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY);
  return messages || [];
}

/**
 * Clear all secure storage
 */
export async function clearSecureStorage(): Promise<void> {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

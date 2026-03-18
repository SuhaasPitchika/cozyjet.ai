"use client";

/**
 * Screenshot Capture System
 * 
 * Captures and encrypts screenshots as proof of work.
 * Uses html2canvas for capture and Web Crypto API for encryption.
 */

import { encryptData } from './encrypted-storage';

// Configuration
const SCREENSHOT_QUALITY = 0.8;
const MAX_WIDTH = 1920;
const STORAGE_KEY = 'maxim_screenshots';

/**
 * Capture a screenshot of a DOM element
 */
export async function captureScreenshot(
  elementId: string,
  options: {
    quality?: number;
    format?: 'png' | 'jpeg';
    width?: number;
  } = {}
): Promise<string | null> {
  const { quality = SCREENSHOT_QUALITY, format = 'jpeg', width = MAX_WIDTH } = options;

  try {
    // Dynamic import to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default;
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return null;
    }

    const canvas = await html2canvas(element, {
      quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: width > element.offsetWidth ? width / element.offsetWidth : 1,
    });

    // Convert to data URL
    const dataUrl = canvas.toDataURL(`image/${format}`, quality);
    
    return dataUrl;
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return null;
  }
}

/**
 * Capture and encrypt a screenshot
 */
export async function captureAndEncryptScreenshot(
  elementId: string,
  metadata?: {
    description?: string;
    app?: string;
    timestamp?: number;
  }
): Promise<{ encrypted: string; timestamp: number } | null> {
  const dataUrl = await captureScreenshot(elementId);
  
  if (!dataUrl) return null;

  // Extract base64 data (remove data:image/xxx;base64, prefix)
  const base64Data = dataUrl.split(',')[1];
  
  // Create encrypted package
  const encryptedData = await encryptData({
    image: base64Data,
    metadata: {
      ...metadata,
      timestamp: metadata?.timestamp || Date.now(),
    },
  });

  return {
    encrypted: encryptedData,
    timestamp: Date.now(),
  };
}

/**
 * Screenshot metadata interface
 */
export interface ScreenshotMetadata {
  id: string;
  description?: string;
  app?: string;
  timestamp: number;
}

/**
 * Store screenshot metadata
 */
export async function storeScreenshotMetadata(metadata: ScreenshotMetadata): Promise<void> {
  const existing = localStorage.getItem(STORAGE_KEY);
  const screenshots: ScreenshotMetadata[] = existing ? JSON.parse(existing) : [];
  
  screenshots.push(metadata);
  
  // Keep only last 50 screenshots
  const trimmed = screenshots.slice(-50);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/**
 * Get all screenshot metadata
 */
export function getScreenshotMetadata(): ScreenshotMetadata[] {
  const existing = localStorage.getItem(STORAGE_KEY);
  return existing ? JSON.parse(existing) : [];
}

/**
 * Clear all screenshots
 */
export function clearScreenshots(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Create a floating capture button component
 */
export function createCaptureButton(
  elementId: string,
  onCapture?: (result: { encrypted: string; timestamp: number } | null) => void
): HTMLButtonElement {
  const button = document.createElement('button');
  button.innerHTML = '📸';
  button.title = 'Capture screenshot';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: #8c6b4f;
    color: white;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background 0.2s;
  `;

  button.addEventListener('click', async () => {
    button.style.transform = 'scale(0.9)';
    button.innerHTML = '⏳';
    
    const result = await captureAndEncryptScreenshot(elementId, {
      timestamp: Date.now(),
    });
    
    if (result) {
      button.innerHTML = '✅';
      setTimeout(() => {
        button.innerHTML = '📸';
        button.style.transform = 'scale(1)';
      }, 1500);
    } else {
      button.innerHTML = '❌';
      setTimeout(() => {
        button.innerHTML = '📸';
        button.style.transform = 'scale(1)';
      }, 2000);
    }
    
    onCapture?.(result);
  });

  button.addEventListener('mouseenter', () => {
    button.style.background = '#6b523c';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = '#8c6b4f';
  });

  return button;
}

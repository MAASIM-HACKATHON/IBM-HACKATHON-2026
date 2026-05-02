import { useEffect, useRef } from 'react';

/**
 * Custom hook for auto-saving data to localStorage with debounce
 * 
 * @param key - The localStorage key to save data under
 * @param data - The data to save (will be JSON stringified)
 * @param delay - Debounce delay in milliseconds (default: 1000ms)
 * @param enabled - Whether auto-save is enabled (default: true)
 */
export function useAutoSave<T>(
  key: string,
  data: T,
  delay: number = 1000,
  enabled: boolean = true
): void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip auto-save on first render to avoid saving initial empty state
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Skip if auto-save is disabled
    if (!enabled) {
      return;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set up new debounced save
    timerRef.current = setTimeout(() => {
      try {
        const dataToSave = {
          data,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(key, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }, delay);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [key, data, delay, enabled]);
}

/**
 * Load saved data from localStorage
 * 
 * @param key - The localStorage key to load data from
 * @returns Object containing the saved data and timestamp, or null if not found
 */
export function loadFromLocalStorage<T>(key: string): {
  data: T;
  timestamp: string;
} | null {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      return null;
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved data from localStorage
 * 
 * @param key - The localStorage key to clear
 */
export function clearFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear from localStorage:', error);
  }
}

/**
 * Format a timestamp into a user-friendly relative time string
 * 
 * @param timestamp - ISO timestamp string
 * @returns Formatted relative time string (e.g., "2 hours ago", "yesterday")
 */
export function formatRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return 'recently';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      // Format as date for older timestamps
      return date.toLocaleDateString();
    }
  } catch (error) {
    console.error('Failed to format relative time:', error);
    return 'recently';
  }
}

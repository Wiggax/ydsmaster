import { Capacitor } from '@capacitor/core';

/**
 * Platform detection utilities
 */
export const Platform = {
    /**
     * Check if running as a native app
     */
    isNative: () => Capacitor.isNativePlatform(),

    /**
     * Check if running on iOS
     */
    isIOS: () => Capacitor.getPlatform() === 'ios',

    /**
     * Check if running on Android
     */
    isAndroid: () => Capacitor.getPlatform() === 'android',

    /**
     * Check if running in web browser
     */
    isWeb: () => Capacitor.getPlatform() === 'web',

    /**
     * Get the current platform name
     */
    getPlatform: () => Capacitor.getPlatform(),

    /**
     * Check if device has a notch (iOS)
     */
    hasNotch: () => {
        if (typeof window === 'undefined') return false;

        // Check for safe area insets
        const safeAreaTop = getComputedStyle(document.documentElement)
            .getPropertyValue('--safe-area-inset-top');

        return safeAreaTop && parseInt(safeAreaTop) > 20;
    },

    /**
     * Get safe area insets
     */
    getSafeAreaInsets: () => {
        if (typeof window === 'undefined') {
            return { top: 0, bottom: 0, left: 0, right: 0 };
        }

        const style = getComputedStyle(document.documentElement);
        return {
            top: parseInt(style.getPropertyValue('--safe-area-inset-top')) || 0,
            bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom')) || 0,
            left: parseInt(style.getPropertyValue('--safe-area-inset-left')) || 0,
            right: parseInt(style.getPropertyValue('--safe-area-inset-right')) || 0,
        };
    },
};

/**
 * Get the appropriate API base URL based on environment
 */
export const getApiUrl = () => {
    // In production native app, use your deployed backend URL
    if (Platform.isNative() && import.meta.env.PROD) {
        return import.meta.env.VITE_API_URL || 'https://ydsmaster.onrender.com';
    }

    // In development, use localhost or local network IP
    if (import.meta.env.DEV) {
        // For mobile development, you might need to use your computer's local IP
        // Example: return 'http://192.168.1.100:3000';
        return 'http://localhost:3000';
    }

    // Default to relative URLs for web
    return '';
};

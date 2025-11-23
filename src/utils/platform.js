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
    console.log('=== getApiUrl DEBUG ===');
    console.log('Platform.isNative():', Platform.isNative());
    console.log('import.meta.env.DEV:', import.meta.env.DEV);
    console.log('import.meta.env.PROD:', import.meta.env.PROD);
    console.log('import.meta.env.MODE:', import.meta.env.MODE);

    // CRITICAL: Check native platform FIRST before dev mode
    // Native (Android / iOS) – always use the Render backend (HTTPS)
    if (Platform.isNative()) {
        console.log('🔵 NATIVE – USING RENDER BACKEND');
        return 'https://ydsmaster.onrender.com';
    }

    // Development web (local) – keep localhost for quick testing
    if (import.meta.env.DEV) {
        console.log('🟢 DEV WEB – USING LOCALHOST');
        return 'http://localhost:3000';
    }

    // Production web – relative URLs (if you ever host the SPA)
    console.log('🟡 PRODUCTION WEB – USING RELATIVE URL');
    return '';
};

import { Preferences } from '@capacitor/preferences';
import { Platform } from '../utils/platform';

/**
 * Storage utility that works on both web and mobile
 */
export const Storage = {
    async setItem(key, value) {
        if (Platform.isNative()) {
            await Preferences.set({ key, value });
        } else {
            localStorage.setItem(key, value);
        }
    },

    async getItem(key) {
        if (Platform.isNative()) {
            const { value } = await Preferences.get({ key });
            return value;
        } else {
            return localStorage.getItem(key);
        }
    },

    async removeItem(key) {
        if (Platform.isNative()) {
            await Preferences.remove({ key });
        } else {
            localStorage.removeItem(key);
        }
    },

    async clear() {
        if (Platform.isNative()) {
            await Preferences.clear();
        } else {
            localStorage.clear();
        }
    }
};

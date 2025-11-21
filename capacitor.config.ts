import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.ydsmaster.pro',
    appName: 'YDS Master Pro',
    webDir: 'dist',
    // server: {
    //     // For development, use your local IP
    //     url: 'http://10.100.228.29:5173',
    //     cleartext: true,
    //     androidScheme: 'http'
    // },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#1a1a2e',
            showSpinner: false,
            androidSpinnerStyle: 'small',
            iosSpinnerStyle: 'small',
            splashFullScreen: true,
            splashImmersive: true
        },
        StatusBar: {
            style: 'dark',
            backgroundColor: '#1a1a2e'
        }
    }
};

export default config;

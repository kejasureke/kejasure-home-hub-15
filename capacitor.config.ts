import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kejasure.rentalapp',
  appName: 'Kejasure',
  webDir: 'dist',
  server: {
    url: 'https://kejasure.pages.dev',
    cleartext: true
  }
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kejasure.rentalapp',
  appName: 'Kejasure',
  webDir: 'dist',
  server: {
    url: 'https://kejasure.pages.dev',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      // Draw the web content behind the status bar for a full-screen, edge-to-edge look
      overlaysWebView: true,
      // Light icons/text since the header is dark green
      style: 'LIGHT',
      backgroundColor: '#00000000'
    }
  }
};

export default config;

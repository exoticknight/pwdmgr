import type { ServiceProviderInfo } from '@/types/service-provider'

/**
 * Built-in service providers list
 * Used for identifying and matching 2FA service providers
 */
export const SERVICE_PROVIDERS: Record<string, ServiceProviderInfo> = {
  Google: {
    name: 'Google',
    websiteUrl: 'https://www.google.com',
    backgroundColor: '#4285f4',
    textColor: '#ffffff',
  },
  GitHub: {
    name: 'GitHub',
    websiteUrl: 'https://github.com',
    backgroundColor: '#24292e',
    textColor: '#ffffff',
  },
  Microsoft: {
    name: 'Microsoft',
    websiteUrl: 'https://www.microsoft.com',
    backgroundColor: '#0078d4',
    textColor: '#ffffff',
  },
  Discord: {
    name: 'Discord',
    websiteUrl: 'https://discord.com',
    backgroundColor: '#5865f2',
    textColor: '#ffffff',
  },
  Steam: {
    name: 'Steam',
    websiteUrl: 'https://store.steampowered.com',
    backgroundColor: '#171a21',
    textColor: '#ffffff',
  },
  Twitter: {
    name: 'Twitter',
    websiteUrl: 'https://twitter.com',
    backgroundColor: '#1da1f2',
    textColor: '#ffffff',
  },
  Facebook: {
    name: 'Facebook',
    websiteUrl: 'https://www.facebook.com',
    backgroundColor: '#1877f2',
    textColor: '#ffffff',
  },
  Amazon: {
    name: 'Amazon',
    websiteUrl: 'https://www.amazon.com',
    backgroundColor: '#ff9900',
    textColor: '#000000',
  },
  Netflix: {
    name: 'Netflix',
    websiteUrl: 'https://www.netflix.com',
    backgroundColor: '#e50914',
    textColor: '#ffffff',
  },
  Apple: {
    name: 'Apple',
    websiteUrl: 'https://www.apple.com',
    backgroundColor: '#007aff',
    textColor: '#ffffff',
  },
  Dropbox: {
    name: 'Dropbox',
    websiteUrl: 'https://www.dropbox.com',
    backgroundColor: '#0061ff',
    textColor: '#ffffff',
  },
  Slack: {
    name: 'Slack',
    websiteUrl: 'https://slack.com',
    backgroundColor: '#4a154b',
    textColor: '#ffffff',
  },
  Zoom: {
    name: 'Zoom',
    websiteUrl: 'https://zoom.us',
    backgroundColor: '#2d8cff',
    textColor: '#ffffff',
  },
  Adobe: {
    name: 'Adobe',
    websiteUrl: 'https://www.adobe.com',
    backgroundColor: '#ff0000',
    textColor: '#ffffff',
  },
  PayPal: {
    name: 'PayPal',
    websiteUrl: 'https://www.paypal.com',
    backgroundColor: '#003087',
    textColor: '#ffffff',
  },
  Instagram: {
    name: 'Instagram',
    websiteUrl: 'https://www.instagram.com',
    backgroundColor: '#e4405f',
    textColor: '#ffffff',
  },
  LinkedIn: {
    name: 'LinkedIn',
    websiteUrl: 'https://www.linkedin.com',
    backgroundColor: '#0077b5',
    textColor: '#ffffff',
  },
  TikTok: {
    name: 'TikTok',
    websiteUrl: 'https://www.tiktok.com',
    backgroundColor: '#000000',
    textColor: '#ffffff',
  },
  Spotify: {
    name: 'Spotify',
    websiteUrl: 'https://www.spotify.com',
    backgroundColor: '#1db954',
    textColor: '#ffffff',
  },
  Twitch: {
    name: 'Twitch',
    websiteUrl: 'https://www.twitch.tv',
    backgroundColor: '#9146ff',
    textColor: '#ffffff',
  },
}

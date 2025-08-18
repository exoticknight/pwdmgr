import type { ServiceProviderInfo } from '@/types/service-provider'

/**
 * Built-in service providers list
 * Used for identifying and matching 2FA service providers
 */
export const SERVICE_PROVIDERS: Record<string, ServiceProviderInfo> = {
  google: {
    name: 'Google',
    websiteUrl: 'https://www.google.com',
    color: '#4285f4',
  },
  github: {
    name: 'GitHub',
    websiteUrl: 'https://github.com',
    color: '#24292e',
  },
  microsoft: {
    name: 'Microsoft',
    websiteUrl: 'https://www.microsoft.com',
    color: '#0078d4',
  },
  discord: {
    name: 'Discord',
    websiteUrl: 'https://discord.com',
    color: '#5865f2',
  },
  steam: {
    name: 'Steam',
    websiteUrl: 'https://store.steampowered.com',
    color: '#171a21',
  },
  twitter: {
    name: 'Twitter',
    websiteUrl: 'https://twitter.com',
    color: '#1da1f2',
  },
  facebook: {
    name: 'Facebook',
    websiteUrl: 'https://www.facebook.com',
    color: '#1877f2',
  },
  amazon: {
    name: 'Amazon',
    websiteUrl: 'https://www.amazon.com',
    color: '#ff9900',
  },
  netflix: {
    name: 'Netflix',
    websiteUrl: 'https://www.netflix.com',
    color: '#e50914',
  },
  apple: {
    name: 'Apple',
    websiteUrl: 'https://www.apple.com',
    color: '#007aff',
  },
  dropbox: {
    name: 'Dropbox',
    websiteUrl: 'https://www.dropbox.com',
    color: '#0061ff',
  },
  slack: {
    name: 'Slack',
    websiteUrl: 'https://slack.com',
    color: '#4a154b',
  },
  zoom: {
    name: 'Zoom',
    websiteUrl: 'https://zoom.us',
    color: '#2d8cff',
  },
  adobe: {
    name: 'Adobe',
    websiteUrl: 'https://www.adobe.com',
    color: '#ff0000',
  },
  paypal: {
    name: 'PayPal',
    websiteUrl: 'https://www.paypal.com',
    color: '#003087',
  },
  instagram: {
    name: 'Instagram',
    websiteUrl: 'https://www.instagram.com',
    color: '#e4405f',
  },
  linkedin: {
    name: 'LinkedIn',
    websiteUrl: 'https://www.linkedin.com',
    color: '#0077b5',
  },
  tiktok: {
    name: 'TikTok',
    websiteUrl: 'https://www.tiktok.com',
    color: '#000000',
  },
  spotify: {
    name: 'Spotify',
    websiteUrl: 'https://www.spotify.com',
    color: '#1db954',
  },
  twitch: {
    name: 'Twitch',
    websiteUrl: 'https://www.twitch.tv',
    color: '#9146ff',
  },
}

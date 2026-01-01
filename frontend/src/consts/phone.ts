/**
 * Phone-related constants for country codes and carriers
 */

export interface CountryPhoneInfo {
  /** ISO 3166-1 alpha-2 country code */
  code: string
  /** Country calling code (without +) */
  dialCode: string
  /** Country emoji flag */
  emoji: string
  /** Country name in English */
  nameEn: string
  /** Country name in native language */
  nameNative: string
  /** List of major carriers */
  carriers: string[]
}

export const COUNTRIES_PHONE_INFO: CountryPhoneInfo[] = [
  {
    code: 'CN',
    dialCode: '86',
    emoji: '🇨🇳',
    nameEn: 'China',
    nameNative: '中国',
    carriers: [
      '中国移动',
      '中国联通',
      '中国电信',
      '中国广电',
    ],
  },
  {
    code: 'JP',
    dialCode: '81',
    emoji: '🇯🇵',
    nameEn: 'Japan',
    nameNative: '日本',
    carriers: [
      'NTT docomo',
      'au (KDDI)',
      'SoftBank',
      'Rakuten Mobile',
      'Y!mobile',
      'UQ mobile',
    ],
  },
  {
    code: 'US',
    dialCode: '1',
    emoji: '🇺🇸',
    nameEn: 'United States',
    nameNative: 'United States',
    carriers: [
      'AT&T',
      'Verizon',
      'T-Mobile',
      'US Cellular',
      'Mint Mobile',
      'Cricket Wireless',
      'Metro by T-Mobile',
    ],
  },
]

/** Get country info by country code */
export function getCountryByCode(code: string): CountryPhoneInfo | undefined {
  return COUNTRIES_PHONE_INFO.find(c => c.code === code)
}

/** Get country info by dial code */
export function getCountryByDialCode(dialCode: string): CountryPhoneInfo | undefined {
  return COUNTRIES_PHONE_INFO.find(c => c.dialCode === dialCode)
}

/** Get all carriers for a specific country */
export function getCarriersByCountryCode(code: string): string[] {
  return getCountryByCode(code)?.carriers || []
}

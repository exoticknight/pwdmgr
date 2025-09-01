import type * as OTPAuth from 'otpauth'
import QrScanner from 'qr-scanner'
import { parseURI } from './2fa'

export class QRScannerService {
  static async scanFromBlob(blob: Blob): Promise<(OTPAuth.TOTP | OTPAuth.HOTP)[]> {
    try {
      const result = await QrScanner.scanImage(blob, {
        returnDetailedScanResult: true,
      })

      if (result?.data) {
        const twoFAData = parseURI(result.data)
        return [twoFAData]
      }

      return []
    }
    catch (error) {
      console.error('Failed to scan QR code from blob:', error)
      throw new Error('Failed to scan QR code from image')
    }
  }
}

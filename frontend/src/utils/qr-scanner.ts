import type { QRCodeData } from '../types/2fa'
import QrScanner from 'qr-scanner'
import { TOTPGenerator } from './totp'

export class QRScannerService {
  /**
   * 从图片文件扫描QR码
   */
  static async scanFromImage(file: File): Promise<QRCodeData[]> {
    try {
      const result = await QrScanner.scanImage(file)

      if (typeof result === 'string') {
        const qrData = TOTPGenerator.parseQRCode(result)
        return [qrData]
      }

      return []
    }
    catch (error) {
      console.error('Failed to scan QR code from image:', error)
      throw new Error('Failed to scan QR code from image')
    }
  }

  /**
   * 从剪贴板扫描QR码
   */
  static async scanFromClipboard(): Promise<QRCodeData[]> {
    try {
      if (!('clipboard' in navigator) || !('read' in navigator.clipboard)) {
        throw new Error('Clipboard API not supported')
      }

      const clipboardItems = await navigator.clipboard.read()
      const results: QRCodeData[] = []

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type)
            const file = new File([blob], 'clipboard-image', { type })
            const qrResults = await this.scanFromImage(file)
            results.push(...qrResults)
          }
        }
      }

      return results
    }
    catch (error) {
      console.error('Failed to scan from clipboard:', error)
      throw new Error('Failed to scan QR code from clipboard')
    }
  }

  /**
   * 从拖拽文件扫描QR码
   */
  static async scanFromDragDrop(dataTransfer: DataTransfer): Promise<QRCodeData[]> {
    try {
      const files = Array.from(dataTransfer.files)
      const results: QRCodeData[] = []

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const qrResults = await this.scanFromImage(file)
          results.push(...qrResults)
        }
      }

      return results
    }
    catch (error) {
      console.error('Failed to scan from drag drop:', error)
      throw new Error('Failed to scan QR code from dropped files')
    }
  }

  /**
   * 解析otpauth://URL
   */
  static parseOtpauthURL(url: string): QRCodeData {
    return TOTPGenerator.parseQRCode(url)
  }

  /**
   * 验证是否为有效的otpauth URL
   */
  static isValidOtpauthURL(url: string): boolean {
    try {
      this.parseOtpauthURL(url)
      return true
    }
    catch {
      return false
    }
  }
}

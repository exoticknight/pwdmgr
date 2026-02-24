import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/browser'
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser'

/**
 * 将 Uint8Array 转换为 base64url 字符串
 */
function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binaryString = ''
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i])
  }
  return btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * 将 base64url 字符串转换为 Uint8Array
 */
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  if (typeof base64Url !== 'string') {
    if (base64Url instanceof Uint8Array) {
      return base64Url
    }
    throw new Error('Invalid credentialId format')
  }
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * 检查浏览器是否支持 WebAuthn
 */
export function isSupported(): boolean {
  return browserSupportsWebAuthn()
}

/**
 * 生成注册选项
 */
export function generateRegistrationOptions(
  rpName: string = 'bei3mat6',
  userId: string = 'user',
  userName: string = 'User',
): PublicKeyCredentialCreationOptionsJSON {
  // 生成随机 challenge (base64url 编码)
  const challengeBytes = new Uint8Array(32)
  crypto.getRandomValues(challengeBytes)
  const challenge = String(uint8ArrayToBase64Url(challengeBytes))

  // user.id 需要是 base64url 编码的字符串
  const userIdBytes = new TextEncoder().encode(userId)
  const userIdBase64 = String(uint8ArrayToBase64Url(userIdBytes))

  return {
    rp: {
      name: rpName,
      id: window.location.hostname || 'localhost',
    },
    user: {
      id: userIdBase64,
      name: userName,
      displayName: userName,
    },
    challenge,
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 }, // ES256
      { type: 'public-key', alg: -257 }, // RS256
    ],
    timeout: 60000,
    attestation: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      requireResidentKey: true,
      userVerification: 'preferred',
    },
  }
}

/**
 * 注册 Passkey
 */
export async function register(
  options: PublicKeyCredentialCreationOptionsJSON,
): Promise<RegistrationResponseJSON> {
  return startRegistration(options)
}

/**
 * 生成认证选项
 */
export function generateAuthenticationOptions(
  credentialId: string | Uint8Array,
): PublicKeyCredentialRequestOptionsJSON {
  // 生成随机 challenge (base64url 编码)
  const challengeBytes = new Uint8Array(32)
  crypto.getRandomValues(challengeBytes)
  const challenge = String(uint8ArrayToBase64Url(challengeBytes))

  // simplewebauthn 期望 allowCredentials[].id 是字符串（base64url编码），不是 Uint8Array
  let credentialIdString: string
  if (credentialId instanceof Uint8Array) {
    credentialIdString = uint8ArrayToBase64Url(credentialId)
  }
  else {
    credentialIdString = credentialId
  }

  return {
    challenge,
    timeout: 60000,
    userVerification: 'preferred',
    allowCredentials: [
      {
        id: credentialIdString,
        type: 'public-key',
      },
    ],
  }
}

/**
 * 认证 Passkey
 */
export async function authenticate(
  options: PublicKeyCredentialRequestOptionsJSON,
): Promise<AuthenticationResponseJSON> {
  return startAuthentication(options)
}

/**
 * 将 base64 字符串转换为 Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * 将 Uint8Array 转换为 base64 字符串
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binaryString = ''
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i])
  }
  return btoa(binaryString)
}

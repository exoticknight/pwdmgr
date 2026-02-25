/**
 * KeyData结构 (使用Object自描述的嵌套格式)
 */

/**
 * FIDO 设备
 */
export interface FidoDevice {
  id: string
  name: string
  credentialId: string // base64
  publicKey: string // base64
  transports?: string[]
  aaguid?: string
  createdAt?: number
  // 加密的 master key（用主密码加密）
  salt: Uint8Array
  iv: Uint8Array
  value: Uint8Array
}

export interface KeyData {
  password: {
    salt: Uint8Array
    iv: Uint8Array
    /** 加密的 master key */
    value: Uint8Array
  }
  recovery: {
    salt: Uint8Array
    iv: Uint8Array
    /** 加密的 master key */
    value: Uint8Array
  }
  fido?: {
    devices: FidoDevice[]
  }
}

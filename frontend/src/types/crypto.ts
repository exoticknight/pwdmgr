/**
 * KeyData结构 (使用Object自描述的嵌套格式)
 */
export interface KeyData {
  password: {
    salt: Uint8Array
    iv: Uint8Array
    encryptedMasterKey: Uint8Array
  }
  recovery: {
    salt: Uint8Array
    iv: Uint8Array
    encryptedMasterKey: Uint8Array
  }
}

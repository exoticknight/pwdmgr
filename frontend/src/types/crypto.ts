export interface KeyData {
  passwordSalt: Uint8Array
  passwordIv: Uint8Array
  passwordEncryptedMasterKey: Uint8Array
  recoverySalt: Uint8Array
  recoveryIv: Uint8Array
  recoveryEncryptedMasterKey: Uint8Array
}

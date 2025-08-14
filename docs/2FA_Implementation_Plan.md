# 密码管理器 2FA 功能实现计划

## 概述

本计划为密码管理器添加完整的两步验证（2FA）功能支持，包含两个主要应用场景：
1. **作为客户端**：存储和管理各种服务的2FA验证码
2. **作为服务提供方**：为密码管理器本身提供2FA保护

本次实现重点关注**客户端2FA功能**，提供完整的TOTP验证码管理功能。

## ✅ 实施状态

### 已完成 (2025-08-14)

- [x] **数据结构设计** - `TwoFactorAuthData` 接口，扩展 `Datum` 联合类型
- [x] **TOTP算法实现** - 基于 `otpauth` 库的完整实现，支持多种哈希算法
- [x] **QR码扫描** - 图片上传、剪贴板扫描、URL解析多种方式
- [x] **客户端服务层** - 验证、转换、服务识别等业务逻辑
- [x] **状态管理** - Svelte 5 reactive 状态管理
- [x] **前端组件**：
  - [x] `totp-display.svelte` - 通用TOTP显示组件（倒计时、复制等）
  - [x] `2fa-new-modal.svelte` - 新建2FA条目模态框（3种输入模式）
  - [x] `2fa-detail.svelte` - 2FA条目详情组件
- [x] **系统集成** - 与现有 `entry-detail-panel.svelte` 集成，完成 `items.svelte` 主界面集成
- [x] **模态框接口统一** - 统一模态框接口规范，遵循现有`password-new-modal`模式
- [x] **导出支持** - CSV和JSON导出功能支持2FA条目
- [x] **代码规范** - 遵循项目约定，使用Svelte 5语法，移除`createEventDispatcher`

### 待集成

- [ ] **条目列表显示** - 在 `entries-list.svelte` 中显示2FA条目
- [ ] **CRUD操作集成** - 连接到现有数据管理系统
- [ ] **导航菜单** - 添加2FA管理菜单项
- [ ] **应用级2FA** - 为密码管理器本身提供2FA保护

## 架构设计原则

- **Go端最小感知**：Go后端只负责文件I/O，不处理2FA逻辑
- **前端完全自主**：所有2FA算法和UI逻辑在前端实现
- **数据加密存储**：2FA密钥使用主密码额外加密
- **多种输入方式**：解决PC端QR码扫描难题
- **安全优先**：实现防重放、失败限制等安全机制
- **代码组织**：通用组件放在components，业务逻辑放在pages下对应目录
- **复用现有列表**：集成到现有的条目管理系统中

## 一、数据类型设计

### 1.1 前端数据类型扩展

**文件位置：** `frontend/src/types/data.ts`

```typescript
export const DataMetaType = {
  PASSWORD: 'password',
  ENCRYPTED_TEXT: 'encrypted_text',
  TWO_FACTOR_AUTH: 'two_factor_auth', // 新增2FA类型
} as const

// 2FA客户端数据（存储各种服务的2FA信息）
export interface TwoFactorAuthData extends BasicData {
  _type: typeof DataMetaType.TWO_FACTOR_AUTH
  title: string
  issuer: string           // 服务提供方（如Google, GitHub等）
  accountName: string      // 在该服务的账户名
  secret: string          // 加密存储的密钥
  algorithm: 'SHA1' | 'SHA256' | 'SHA512'
  digits: 6 | 8
  period: number
  notes?: string
  // 客户端特有字段
  serviceUrl?: string     // 服务网址
  iconUrl?: string       // 服务图标
}

// 更新联合类型
export type Datum = PasswordData | EncryptedTextData | TwoFactorAuthData
```

### 1.2 应用级2FA配置类型

**文件位置：** `frontend/src/types/app-2fa.ts`

```typescript
// 应用作为服务提供方的2FA配置
export interface App2FAConfig {
  enabled: boolean
  secret: string              // 应用的2FA密钥
  backupCodes: string[]       // 备用恢复码（哈希存储）
  trustedDevices: string[]    // 信任设备指纹
  failedAttempts: number      // 失败尝试计数
  lastUsedCode: string        // 最后使用的验证码（防重放）
  setupComplete: boolean      // 是否完成设置
  issuer: string             // 发行者名称（应用名）
  accountLabel: string       // 账户标识（用户选择）
}

// TOTP配置接口
export interface TOTPConfig {
  secret: string
  algorithm: 'SHA1' | 'SHA256' | 'SHA512'
  digits: 6 | 8
  period: number
  issuer?: string
  accountName?: string
}

// TOTP结果接口
export interface TOTPResult {
  code: string
  remainingTime: number
  progress: number // 0-1之间的进度
  nextCode?: string // 下一个验证码预览
}

// QR码解析结果
export interface QRCodeData {
  type: 'totp' | 'hotp'
  label: string
  secret: string
  issuer?: string
  algorithm?: string
  digits?: string
  period?: string
}
```

## 二、已实现的文件结构

```
frontend/src/
├── components/
│   └── totp-display.svelte              # TOTP验证码显示组件（通用）
├── pages/
│   └── items/
│       └── 2fa/                         # 2FA业务页面
│           ├── 2fa-new-modal.svelte     # 新建2FA模态框
│           └── 2fa-detail.svelte        # 2FA详情页面
├── services/
│   └── 2fa-client.ts                    # 客户端2FA服务
├── stores/
│   └── 2fa-client.svelte.ts             # 客户端2FA状态管理（Svelte 5）
├── types/
│   ├── data.ts                          # 扩展的数据类型定义
│   └── 2fa.ts                           # 2FA相关类型定义
└── utils/
    ├── totp.ts                          # TOTP算法实现
    └── qr-scanner.ts                    # QR码扫描工具
```

## 三、已实现的核心功能

### 3.1 PC端QR码扫描解决方案

由于PC端没有摄像头或扫描不便，提供多种输入方式：

#### 方案1：图片文件导入
- 用户截图保存QR码图片
- 通过文件选择器上传图片
- 使用jsQR库解析图片中的QR码

#### 方案2：屏幕截图扫描
- 集成屏幕截图功能
- 自动识别屏幕上的QR码
- 支持部分区域截图

#### 方案3：剪贴板扫描
- 监听剪贴板图片数据
- 自动解析剪贴板中的QR码图片
- 一键粘贴导入

#### 方案4：拖拽导入
- 支持图片文件拖拽到界面
- 自动识别并解析QR码
- 直观的用户体验

#### 方案5：手动输入
- 提供完整的手动输入界面
- 支持密钥、发行者、账户名等信息输入
- 实时验证码预览

#### 方案6：URL导入
- 支持otpauth://格式的URL粘贴
- 自动解析URL参数
- 快速批量导入

### 3.2 设置向导实现

**文件位置：** `frontend/src/components/2fa/client/setup-wizard.svelte`

支持的设置方式：
1. **图片导入** - 上传QR码图片
2. **屏幕截图** - 扫描屏幕QR码
3. **剪贴板扫描** - 从剪贴板导入
4. **手动输入** - 手动输入所有信息
5. **URL导入** - 粘贴otpauth://链接
6. **批量导入** - 从其他应用导出的文件

### 3.3 核心功能组件

#### TOTP显示组件
- 实时生成6位/8位验证码
- 30秒倒计时环形进度条
- 一键复制验证码功能
- 下一个验证码预览

#### 服务图标识别
- 自动识别知名服务商
- 显示对应的品牌图标
- 支持自定义图标上传

#### 批量管理
- 支持多选操作
- 批量导出/导入
- 分类标签管理

## 四、场景二：应用级2FA（服务提供方）

### 4.1 应用2FA设置流程

1. **说明页面** - 解释2FA的作用和要求
2. **生成密钥** - 创建应用专用的2FA密钥
3. **QR码展示** - 显示供认证器扫描的QR码
4. **手动输入选项** - 提供手动输入的详细信息
5. **验证设置** - 用户输入验证码确认设置成功
6. **备用码生成** - 生成10个备用恢复码
7. **完成设置** - 保存配置并启用2FA

### 4.2 登录验证流程

修改现有登录流程：
- **原流程**：选择文件 → 输入密码 → 进入应用
- **新流程**：选择文件 → 输入密码 → (2FA验证) → 进入应用

### 4.3 2FA验证界面

支持两种验证方式：
1. **TOTP验证码** - 认证器生成的6位数字
2. **备用恢复码** - 设置时生成的8位备用码

### 4.4 安全特性

- **防重放攻击** - 记录最近使用的验证码
- **失败尝试限制** - 5次失败后锁定
- **时间窗口容错** - ±30秒时间偏差允许
- **备用码一次性** - 使用后立即失效
- **设备信任** - 可选的信任设备功能

## 五、核心服务实现

### 5.1 TOTP算法服务

**文件位置：** `frontend/src/services/totp-generator.service.ts`

```typescript
export class TOTPGenerator {
  // 生成TOTP验证码
  static generate(config: TOTPConfig): TOTPResult

  // 解析QR码URL
  static parseQRCode(url: string): QRCodeData

  // 验证secret格式
  static validateSecret(secret: string): boolean

  // 计算剩余时间
  static getRemainingTime(period: number): number

  // 生成随机密钥
  static generateSecret(): string

  // Base32编解码
  static base32Encode(buffer: Uint8Array): string
  static base32Decode(encoded: string): Uint8Array

  // HMAC-SHA计算
  static hmacSHA(algorithm: string, key: Uint8Array, counter: Uint8Array): Uint8Array
}
```

### 5.2 应用级2FA服务

**文件位置：** `frontend/src/services/2fa-app.service.ts`

```typescript
export class App2FAService {
  // 生成应用专用密钥
  generateAppSecret(): string

  // 生成应用QR码
  generateAppQRCode(secret: string, issuer: string, account: string): string

  // 验证应用2FA码
  async verifyApp2FA(code: string): Promise<boolean>

  // 验证备用恢复码
  async verifyBackupCode(code: string): Promise<boolean>

  // 生成备用恢复码
  generateBackupCodes(count?: number): string[]

  // 重新生成备用码
  async regenerateBackupCodes(): Promise<string[]>

  // 获取/设置应用2FA配置
  async getApp2FAConfig(): Promise<App2FAConfig>
  async saveApp2FAConfig(config: App2FAConfig): Promise<void>

  // 禁用应用2FA
  async disableApp2FA(password: string, verificationCode: string): Promise<void>
}
```

### 5.3 客户端2FA服务

**文件位置：** `frontend/src/services/2fa-client.service.ts`

```typescript
export class Client2FAService {
  // CRUD操作
  async add2FAEntry(data: TwoFactorAuthData): Promise<void>
  async update2FAEntry(id: string, data: Partial<TwoFactorAuthData>): Promise<void>
  async delete2FAEntry(id: string): Promise<void>
  async get2FAEntry(id: string): Promise<TwoFactorAuthData>
  async list2FAEntries(): Promise<TwoFactorAuthData[]>

  // 验证码生成
  generateCurrentTOTP(entry: TwoFactorAuthData): TOTPResult

  // 导入导出
  async importFromBackup(file: File): Promise<TwoFactorAuthData[]>
  async exportToBackup(entries: TwoFactorAuthData[]): Promise<string>

  // QR码处理
  async importFromQRCode(qrData: string): Promise<TwoFactorAuthData>
  exportToQRCode(entry: TwoFactorAuthData): string

  // 服务商识别
  identifyServiceProvider(issuer: string): ServiceProviderInfo
}
```

### 5.4 QR扫描服务

**文件位置：** `frontend/src/services/qr-scanner.service.ts`

```typescript
export class QRScannerService {
  // 图片文件扫描
  async scanFromImage(file: File): Promise<QRCodeData[]>

  // 剪贴板扫描
  async scanFromClipboard(): Promise<QRCodeData[]>

  // 屏幕截图扫描（需要Wails支持）
  async scanFromScreenshot(): Promise<QRCodeData[]>

  // 拖拽文件扫描
  async scanFromDragDrop(dataTransfer: DataTransfer): Promise<QRCodeData[]>

  // URL解析
  parseOtpauthURL(url: string): QRCodeData

  // 通用图片处理
  private processImage(imageData: string): Promise<QRCodeData[]>
}
```

## 六、状态管理

### 6.1 应用2FA状态

**文件位置：** `frontend/src/stores/app-2fa.svelte.ts`

```typescript
export const app2FA = $state({
  enabled: false,
  setupStep: 'disabled', // 'disabled' | 'generating' | 'verifying' | 'completed'
  config: null as App2FAConfig | null,
  tempSecret: '',
  tempQRCode: '',
  verificationAttempts: 0,
})

export class App2FAManager {
  // 设置流程控制
  async startSetup(): Promise<void>
  async completeSetup(verificationCode: string): Promise<void>
  async cancelSetup(): Promise<void>

  // 验证相关
  async verify(code: string, useBackup?: boolean): Promise<boolean>
  async regenerateBackupCodes(): Promise<string[]>

  // 配置管理
  async enable(): Promise<void>
  async disable(password: string, code: string): Promise<void>
  async getStatus(): Promise<App2FAConfig>
}
```

### 6.2 客户端2FA状态

**文件位置：** `frontend/src/stores/2fa-client.svelte.ts`

```typescript
export const client2FA = $state({
  entries: [] as TwoFactorAuthData[],
  currentCodes: new Map<string, TOTPResult>(),
  isLoading: false,
  searchQuery: '',
  selectedTags: [] as string[],
})

export class Client2FAManager {
  // 数据管理
  async loadEntries(): Promise<void>
  async addEntry(data: TwoFactorAuthData): Promise<void>
  async updateEntry(id: string, data: Partial<TwoFactorAuthData>): Promise<void>
  async deleteEntry(id: string): Promise<void>

  // 验证码管理
  startCodeGeneration(): void
  stopCodeGeneration(): void
  getCurrentCode(entryId: string): TOTPResult | null

  // 搜索过滤
  filterEntries(): TwoFactorAuthData[]

  // 批量操作
  async importEntries(file: File): Promise<void>
  async exportEntries(entryIds: string[]): Promise<void>
}
```

## 七、UI组件设计

### 7.1 客户端2FA组件

#### TOTP显示组件
```svelte
<!-- frontend/src/components/2fa/client/totp-display.svelte -->
<script>
  interface Props {
    entry: TwoFactorAuthData
    showNextCode?: boolean
    autoRefresh?: boolean
  }
</script>

<!-- 显示当前验证码、倒计时、复制按钮等 -->
```

#### 服务图标组件
```svelte
<!-- frontend/src/components/2fa/client/service-icon.svelte -->
<script>
  interface Props {
    issuer: string
    size?: 'sm' | 'md' | 'lg'
    fallbackIcon?: string
  }
</script>

<!-- 显示服务商品牌图标 -->
```

### 7.2 应用级2FA组件

#### 2FA设置向导
```svelte
<!-- frontend/src/components/2fa/app/app-2fa-setup.svelte -->
<script>
  interface Props {
    onComplete: () => void
    onCancel: () => void
  }
</script>

<!-- 多步骤设置向导 -->
```

#### 2FA验证界面
```svelte
<!-- frontend/src/components/2fa/app/app-2fa-verify.svelte -->
<script>
  interface Props {
    onSuccess: () => void
    onFailure: (error: string) => void
  }
</script>

<!-- 登录时的2FA验证界面 -->
```

## 八、集成到现有应用

### 8.1 数据库集成

- 2FA条目作为新的数据类型存储在现有数据库中
- 应用2FA配置存储在设置数据中
- 所有敏感数据使用主密码加密
- 保持向下兼容，不影响现有功能

### 8.2 导航和路由

在现有导航中添加2FA相关页面：
- 主导航添加"两步验证"选项
- 设置页面添加"应用保护"部分
- 添加2FA条目的增删改查页面

### 8.3 登录流程修改

**修改文件：** `frontend/src/pages/landing.svelte`

在密码验证成功后检查是否启用了应用2FA，如果启用则跳转到2FA验证页面。

### 8.4 自动锁定集成

**修改文件：** `frontend/src/components/auto-lock.svelte`

解锁时如果启用了应用2FA，需要同时验证密码和2FA码。

## 九、安全考虑

### 9.1 数据加密
- 2FA密钥使用主密码 + 随机盐进行AES加密
- 备用恢复码使用不可逆哈希存储
- 设备指纹使用机器信息生成
- 所有敏感配置单独加密保护

### 9.2 防护措施
- **防重放攻击**：记录最近30秒内使用的验证码
- **暴力破解防护**：失败5次后锁定账户30分钟
- **时间同步容错**：允许±30秒的时间偏差
- **会话管理**：2FA验证后的会话有效期控制

### 9.3 备份和恢复
- 提供备用恢复码作为应急访问方式
- 支持通过主密码 + 安全问题重置应用2FA
- 数据导出时需要额外的2FA验证确认
- 定期提醒用户更新备用恢复码

## 十、依赖库

### 10.1 前端依赖
```json
{
  "otpauth": "^9.0.0",           // TOTP/HOTP算法实现
  "lean-qr": "^2.5.0",           // QR码生成
  "qr-scanner": "^1.4.2",             // QR码解析
}
```

### 10.2 可选依赖
- `node-screenshots` - 屏幕截图功能（需要Wails支持）
- `file-saver` - 文件下载保存
- `qrcode-generator` - 轻量级QR码生成

## 十一、实现状态

### 已完成 ✅

**基础架构**
- [x] 创建数据类型定义（TwoFactorAuthData）
- [x] 实现TOTP算法核心（utils/totp.ts）
- [x] 建立基础文件结构
- [x] 创建状态管理（Svelte 5语法）

**客户端2FA功能**
- [x] 实现QR码解析和多种输入方式（图片上传、URL粘贴）
- [x] 创建TOTP显示组件（components/totp-display.svelte）
- [x] 实现2FA新建模态框（pages/items/2fa/2fa-new-modal.svelte）
- [x] 实现2FA详情页面（pages/items/2fa/2fa-detail.svelte）
- [x] 创建客户端2FA服务（services/2fa-client.ts）
- [x] 实现QR扫描工具（utils/qr-scanner.ts）
- [x] 集成@lucide/svelte图标库

**已实现的功能特性**
- [x] 手动输入2FA信息
- [x] 图片文件QR码扫描
- [x] 剪贴板图片QR码扫描
- [x] otpauth:// URL解析
- [x] 实时TOTP验证码生成和显示
- [x] 30秒倒计时环形进度条
- [x] 验证码复制功能
- [x] 服务提供商识别和图标显示
- [x] 数据验证和错误处理

### 待实现 📋

**集成到现有系统**
- [ ] 集成到现有条目列表显示
- [ ] 添加导航菜单项
- [ ] 与现有数据管理系统整合
- [ ] 实现数据的增删改查操作

**增强功能**
- [ ] 备份导出功能
- [ ] 批量导入功能
- [ ] 搜索和过滤功能
- [ ] 标签管理
- [ ] 拖拽导入支持

**应用级2FA（后续阶段）**
- [ ] 实现应用2FA设置流程
- [ ] 创建验证界面
- [ ] 集成到登录流程
- [ ] 实现备用恢复码功能

### 下一步计划

1. **与现有系统集成**：将2FA条目类型集成到现有的条目管理系统中
2. **完善用户界面**：优化交互体验和视觉设计
3. **数据持久化**：确保2FA数据正确保存和加载
4. **测试和优化**：进行全面的功能测试和性能优化

## 十二、使用说明

### 添加2FA条目

1. **手动输入方式**：
   - 填写服务提供商、账户名
   - 输入Base32格式的密钥
   - 配置算法、位数、周期等参数

2. **图片导入方式**：
   - 上传包含QR码的图片文件
   - 支持从剪贴板粘贴图片

3. **URL导入方式**：
   - 粘贴otpauth://格式的URL
   - 自动解析所有参数

### 查看验证码

- 实时显示6位或8位验证码
- 30秒倒计时进度指示
- 一键复制验证码
- 可选择显示/隐藏验证码
- 显示下一个验证码预览（可选）

### 管理2FA条目

- 查看详细信息（服务信息、技术参数、元数据）
- 编辑条目信息
- 删除条目
- 收藏/取消收藏

## 十二、测试计划

### 12.1 单元测试
- TOTP算法正确性测试
- QR码解析准确性测试
- 加密解密功能测试
- 状态管理逻辑测试

### 12.2 集成测试
- 登录流程完整测试
- 数据导入导出测试
- 多设备同步测试
- 异常情况处理测试

### 12.3 安全测试
- 防重放攻击测试
- 暴力破解防护测试
- 数据加密安全测试
- 会话管理安全测试

### 12.4 用户体验测试
- 多种输入方式易用性
- 界面响应性测试
- 错误提示友好性
- 帮助文档完整性

## 总结

本次实现完成了密码管理器2FA客户端功能的核心架构和基础组件，主要成果包括：

### 已完成的核心功能

1. **完整的2FA数据类型支持**：扩展现有数据结构，支持TOTP类型的条目
2. **强大的TOTP算法实现**：基于otpauth库的完整TOTP生成和验证功能
3. **多样化的输入方式**：支持手动输入、图片扫描、URL粘贴等多种方式
4. **现代化的UI组件**：基于Svelte 5语法的响应式组件
5. **清晰的代码架构**：通用组件与业务逻辑合理分离

### 技术特点

- **前端完全自主**：所有2FA逻辑在前端实现，Go后端只负责数据存储
- **安全可靠**：使用成熟的otpauth库，支持多种哈希算法和配置
- **用户友好**：解决PC端QR码扫描难题，提供多种便捷的输入方式
- **现代化技术栈**：使用Svelte 5、TypeScript、Tailwind CSS等现代前端技术

### 下一步发展

当前实现为2FA功能奠定了坚实基础，后续可以：

1. **完善集成**：与现有条目管理系统深度整合
2. **增强功能**：添加备份导出、批量管理等高级功能
3. **应用保护**：实现应用级2FA，为密码管理器本身提供安全保护
4. **用户体验**：持续优化界面设计和交互流程

整个设计保持了与现有代码架构的一致性，采用渐进式实现策略，确保在开发过程中不影响现有功能的正常使用。通过模块化的架构设计，为未来的功能扩展预留了充足空间。

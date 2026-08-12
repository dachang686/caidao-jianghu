import type { AssetId, WorldRegionId } from './ids'

export type AssetKind = 'image' | 'audio'
export type ImageAssetFormat = 'webp'
export type AudioAssetFormat = 'wav' | 'mp3' | 'ogg'
export type AssetFormat = ImageAssetFormat | AudioAssetFormat
export type AssetUsage = 'menu-background' | 'region-background' | 'character-sprite' | 'bgm' | 'sfx'

/**
 * 资源清单只登记随包发布的本地资源；运行时不根据用户输入拼接远程 URL。
 * sizeBytes 是源文件估算值，budgetBytes 是该资源允许占用的预算上限。
 */
export interface AssetDefinition {
  readonly id: AssetId
  readonly kind: AssetKind
  readonly format: AssetFormat
  readonly src: string
  readonly usage: AssetUsage
  readonly sizeBytes: number
  readonly budgetBytes: number
}

export interface AssetRegionManifest {
  readonly regionId: WorldRegionId
  readonly assetIds: readonly AssetId[]
  readonly budgetBytes: number
}

export interface AssetManifest {
  readonly version: number
  readonly assets: readonly AssetDefinition[]
  readonly globalAssetIds: readonly AssetId[]
  readonly regions: readonly AssetRegionManifest[]
}

export type AssetValidationIssueCode =
  | 'duplicate_id'
  | 'duplicate_reference'
  | 'missing_reference'
  | 'remote_source'
  | 'unsupported_format'
  | 'invalid_size'
  | 'budget_exceeded'
  | 'manifest_version'

export interface AssetValidationIssue {
  readonly code: AssetValidationIssueCode
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface AssetValidationResult {
  readonly valid: boolean
  readonly issues: readonly AssetValidationIssue[]
}


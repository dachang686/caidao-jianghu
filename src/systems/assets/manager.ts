import type {
  AssetDefinition,
  AssetManifest,
  AssetValidationIssue,
  AssetValidationResult,
} from '../../types/assets'
import type { AssetId, WorldRegionId } from '../../types/ids'

export interface AssetResourceLoader {
  load(definition: AssetDefinition): Promise<unknown>
  release?(definition: AssetDefinition, resource: unknown): void
}

export interface AssetLifecycleSnapshot {
  readonly currentRegionId: WorldRegionId | null
  readonly globalRetained: boolean
  readonly cache: readonly {
    readonly id: AssetId
    readonly kind: AssetDefinition['kind']
    readonly state: 'loading' | 'ready' | 'error'
    readonly references: number
    readonly sizeBytes: number
    readonly error?: string
  }[]
}

export interface AssetLifecycleManagerOptions {
  readonly loader?: AssetResourceLoader
}

export class AssetManifestValidationError extends Error {
  readonly issues: readonly AssetValidationIssue[]

  constructor(issues: readonly AssetValidationIssue[]) {
    super(issues.map((issue) => `${issue.path} [${issue.code}] ${issue.message}`).join('\n'))
    this.name = 'AssetManifestValidationError'
    this.issues = issues
  }
}

export class AssetLifecycleError extends Error {
  readonly regionId?: WorldRegionId

  constructor(message: string, regionId?: WorldRegionId) {
    super(message)
    this.name = 'AssetLifecycleError'
    this.regionId = regionId
  }
}

function isRemoteSource(source: string): boolean {
  const trimmed = source.trim()
  if (!trimmed) return false
  if (/^https?:\/\//i.test(trimmed)) {
    if (typeof window !== 'undefined') {
      try {
        return new URL(trimmed, window.location.href).origin !== window.location.origin
      } catch {
        return true
      }
    }
    return true
  }
  if (/^(wss?:|ftp:|\/\/)/i.test(trimmed)) return true
  return /^[a-z][a-z\d+.-]*:/i.test(trimmed) && !/^(file|data|blob):/i.test(trimmed)
}

function sourcePath(source: string): string {
  return source.split(/[?#]/, 1)[0]!.toLowerCase()
}

function pushIssue(
  issues: AssetValidationIssue[],
  code: AssetValidationIssue['code'],
  path: string,
  message: string,
  id?: string,
): void {
  issues.push({ code, path, message, ...(id ? { id } : {}) })
}

function duplicateReferences(values: readonly AssetId[], path: string, issues: AssetValidationIssue[]): void {
  const seen = new Set<string>()
  values.forEach((id, index) => {
    const value = String(id)
    if (seen.has(value)) pushIssue(issues, 'duplicate_reference', `${path}[${index}]`, `资源引用重复「${value}」`, value)
    seen.add(value)
  })
}

/** 构建期和运行时共用的本地资源清单校验。 */
export function validateAssetManifest(manifest: AssetManifest | undefined): AssetValidationResult {
  if (!manifest) return { valid: true, issues: [] }
  const issues: AssetValidationIssue[] = []
  if (!Number.isInteger(manifest.version) || manifest.version < 1) {
    pushIssue(issues, 'manifest_version', 'assetManifest.version', '资源清单版本必须是大于 0 的整数')
  }

  const byId = new Map<string, AssetDefinition>()
  manifest.assets.forEach((asset, index) => {
    const id = String(asset.id)
    if (byId.has(id)) pushIssue(issues, 'duplicate_id', `assetManifest.assets[${index}].id`, `重复资源 ID「${id}」`, id)
    byId.set(id, asset)
    if (!asset.src.trim()) pushIssue(issues, 'invalid_size', `assetManifest.assets[${index}].src`, '资源 URL 不能为空', id)
    if (isRemoteSource(asset.src)) pushIssue(issues, 'remote_source', `assetManifest.assets[${index}].src`, '资源必须来自随包发布的本地 URL', id)
    const path = sourcePath(asset.src)
    if (asset.kind === 'image' && (asset.format !== 'webp' || !path.endsWith('.webp'))) {
      pushIssue(issues, 'unsupported_format', `assetManifest.assets[${index}]`, '图片资源必须使用 WebP', id)
    }
    if (asset.kind === 'audio' && !(['wav', 'mp3', 'ogg'] as const).includes(asset.format as 'wav' | 'mp3' | 'ogg')) {
      pushIssue(issues, 'unsupported_format', `assetManifest.assets[${index}].format`, '音频只允许 wav、mp3 或 ogg', id)
    }
    if (!Number.isInteger(asset.sizeBytes) || asset.sizeBytes <= 0 || !Number.isInteger(asset.budgetBytes) || asset.budgetBytes <= 0) {
      pushIssue(issues, 'invalid_size', `assetManifest.assets[${index}]`, '资源大小与预算必须是大于 0 的整数', id)
    } else if (asset.sizeBytes > asset.budgetBytes) {
      pushIssue(issues, 'budget_exceeded', `assetManifest.assets[${index}].sizeBytes`, '资源估算大小超过自身预算', id)
    }
  })

  duplicateReferences(manifest.globalAssetIds, 'assetManifest.globalAssetIds', issues)
  manifest.globalAssetIds.forEach((id, index) => {
    if (!byId.has(String(id))) pushIssue(issues, 'missing_reference', `assetManifest.globalAssetIds[${index}]`, `找不到资源「${id}」`, String(id))
  })

  const regions = new Set<string>()
  manifest.regions.forEach((region, index) => {
    const regionId = String(region.regionId)
    if (regions.has(regionId)) pushIssue(issues, 'duplicate_id', `assetManifest.regions[${index}].regionId`, `重复区域资源清单「${regionId}」`, regionId)
    regions.add(regionId)
    duplicateReferences(region.assetIds, `assetManifest.regions[${index}].assetIds`, issues)
    let totalBytes = 0
    region.assetIds.forEach((id, assetIndex) => {
      const asset = byId.get(String(id))
      if (!asset) {
        pushIssue(issues, 'missing_reference', `assetManifest.regions[${index}].assetIds[${assetIndex}]`, `找不到资源「${id}」`, String(id))
        return
      }
      totalBytes += asset.sizeBytes
    })
    if (!Number.isInteger(region.budgetBytes) || region.budgetBytes <= 0) {
      pushIssue(issues, 'invalid_size', `assetManifest.regions[${index}].budgetBytes`, '区域预算必须是大于 0 的整数', regionId)
    } else if (totalBytes > region.budgetBytes) {
      pushIssue(issues, 'budget_exceeded', `assetManifest.regions[${index}].budgetBytes`, '区域资源总量超过预算', regionId)
    }
  })
  const referencedAssetIds = new Set([
    ...manifest.globalAssetIds.map(String),
    ...manifest.regions.flatMap((region) => region.assetIds.map(String)),
  ])
  manifest.assets.forEach((asset, index) => {
    if (!referencedAssetIds.has(String(asset.id))) {
      pushIssue(issues, 'missing_reference', `assetManifest.assets[${index}].id`, `资源未被全局或区域清单使用「${asset.id}」`, String(asset.id))
    }
  })
  return { valid: issues.length === 0, issues }
}

export function assertValidAssetManifest(manifest: AssetManifest): void {
  const result = validateAssetManifest(manifest)
  if (!result.valid) throw new AssetManifestValidationError(result.issues)
}

function loadImage(src: string): Promise<unknown> {
  if (typeof Image === 'undefined') return Promise.resolve({ src })
  const image = new Image()
  image.decoding = 'async'
  return new Promise((resolve, reject) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      resolve(image)
    }
    image.onload = done
    image.onerror = () => {
      if (settled) return
      settled = true
      reject(new Error(`图片加载失败：${src}`))
    }
    image.src = src
    if (typeof image.decode === 'function') void image.decode().then(done).catch(() => { if (image.complete) done() })
  })
}

function loadAudio(src: string): Promise<unknown> {
  if (typeof Audio === 'undefined') return Promise.resolve({ src })
  const audio = new Audio()
  audio.preload = 'auto'
  return new Promise((resolve, reject) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      resolve(audio)
    }
    audio.oncanplaythrough = done
    audio.onerror = () => {
      if (settled) return
      settled = true
      reject(new Error(`音频加载失败：${src}`))
    }
    audio.src = src
    audio.load()
  })
}

export function createBrowserAssetLoader(): AssetResourceLoader {
  return {
    load: (definition) => definition.kind === 'image' ? loadImage(definition.src) : loadAudio(definition.src),
    release: (definition, resource) => {
      if (!resource || typeof resource !== 'object') return
      if (definition.kind === 'image') {
        const image = resource as HTMLImageElement
        image.onload = null
        image.onerror = null
        image.src = ''
        return
      }
      const audio = resource as HTMLAudioElement
      audio.pause()
      audio.oncanplaythrough = null
      audio.onerror = null
      audio.removeAttribute('src')
      audio.load()
    },
  }
}

interface CacheEntry {
  readonly definition: AssetDefinition
  references: number
  state: 'loading' | 'ready' | 'error'
  resource?: unknown
  resourceLoaded: boolean
  loading: Promise<unknown> | null
  error?: string
}

const GLOBAL_SCOPE = 'global'

/** 区域资源按 scope 引用计数，保证重复进入/离开不会堆积缓存或加载任务。 */
export class AssetLifecycleManager {
  private readonly loader: AssetResourceLoader
  private readonly assets = new Map<string, AssetDefinition>()
  private readonly regions = new Map<string, AssetManifest['regions'][number]>()
  private readonly globalAssetIds: readonly string[]
  private readonly cache = new Map<string, CacheEntry>()
  private readonly scopes = new Map<string, Set<string>>()
  private transition: Promise<unknown> = Promise.resolve()
  private currentRegionId: WorldRegionId | null = null

  constructor(manifest: AssetManifest, options: AssetLifecycleManagerOptions = {}) {
    assertValidAssetManifest(manifest)
    manifest.assets.forEach((asset) => this.assets.set(String(asset.id), asset))
    manifest.regions.forEach((region) => this.regions.set(String(region.regionId), region))
    this.globalAssetIds = manifest.globalAssetIds.map(String)
    this.loader = options.loader ?? createBrowserAssetLoader()
  }

  preloadGlobal(): Promise<AssetLifecycleSnapshot> {
    return this.enqueue(async () => {
      await this.retainScope(GLOBAL_SCOPE, this.globalIds())
      return this.snapshot()
    })
  }

  releaseGlobal(): Promise<AssetLifecycleSnapshot> {
    return this.enqueue(async () => {
      this.releaseScope(GLOBAL_SCOPE)
      return this.snapshot()
    })
  }

  enterRegion(regionId: WorldRegionId): Promise<AssetLifecycleSnapshot> {
    return this.enqueue(async () => {
      const region = this.regions.get(String(regionId))
      if (!region) throw new AssetLifecycleError(`资源清单没有登记区域「${regionId}」。`, regionId)
      if (this.currentRegionId === regionId) return this.snapshot()
      const previousRegionId = this.currentRegionId
      const nextScope = this.regionScope(regionId)
      await this.retainScope(nextScope, region.assetIds.map(String))
      if (previousRegionId) this.releaseScope(this.regionScope(previousRegionId))
      this.currentRegionId = regionId
      return this.snapshot()
    })
  }

  leaveRegion(regionId?: WorldRegionId): Promise<AssetLifecycleSnapshot> {
    return this.enqueue(async () => {
      const leaving = regionId ?? this.currentRegionId
      if (leaving) this.releaseScope(this.regionScope(leaving))
      if (!regionId || this.currentRegionId === regionId) this.currentRegionId = null
      return this.snapshot()
    })
  }

  getResource(assetId: AssetId): unknown | undefined {
    const entry = this.cache.get(String(assetId))
    return entry?.state === 'ready' ? entry.resource : undefined
  }

  snapshot(): AssetLifecycleSnapshot {
    return {
      currentRegionId: this.currentRegionId,
      globalRetained: Boolean(this.scopes.get(GLOBAL_SCOPE)?.size),
      cache: [...this.cache.values()]
        .sort((left, right) => String(left.definition.id).localeCompare(String(right.definition.id)))
        .map((entry) => ({
          id: entry.definition.id,
          kind: entry.definition.kind,
          state: entry.state,
          references: entry.references,
          sizeBytes: entry.definition.sizeBytes,
          ...(entry.error ? { error: entry.error } : {}),
        })),
    }
  }

  /** 页面壳卸载或测试结束时调用；不会触碰存档和领域状态。 */
  dispose(): void {
    this.scopes.clear()
    this.currentRegionId = null
    for (const entry of [...this.cache.values()]) {
      entry.references = 0
      if (entry.loading) continue
      this.disposeEntry(entry)
    }
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.transition.then(operation)
    this.transition = next.then(() => undefined, () => undefined)
    return next
  }

  private globalIds(): string[] {
    return [...this.globalAssetIds]
  }

  private regionScope(regionId: WorldRegionId): string {
    return `region:${String(regionId)}`
  }

  private async retainScope(scope: string, ids: readonly string[]): Promise<void> {
    const retained = this.scopes.get(scope) ?? new Set<string>()
    this.scopes.set(scope, retained)
    const acquired: string[] = []
    try {
      for (const id of ids) {
        if (retained.has(id)) continue
        const definition = this.assets.get(id)
        if (!definition) throw new AssetLifecycleError(`资源清单没有登记资源「${id}」。`)
        const entry = this.cache.get(id) ?? this.createEntry(definition)
        retained.add(id)
        entry.references += 1
        try {
          await this.ensureLoaded(entry)
          acquired.push(id)
        } catch (error) {
          retained.delete(id)
          this.releaseEntry(entry)
          throw error
        }
      }
    } catch (error) {
      for (const id of acquired) {
        retained.delete(id)
        const entry = this.cache.get(id)
        if (entry) this.releaseEntry(entry)
      }
      if (retained.size === 0) this.scopes.delete(scope)
      throw error
    }
  }

  private releaseScope(scope: string): void {
    const retained = this.scopes.get(scope)
    if (!retained) return
    this.scopes.delete(scope)
    for (const id of retained) {
      const entry = this.cache.get(id)
      if (entry) this.releaseEntry(entry)
    }
  }

  private createEntry(definition: AssetDefinition): CacheEntry {
    const entry: CacheEntry = { definition, references: 0, state: 'loading', resourceLoaded: false, loading: null }
    this.cache.set(String(definition.id), entry)
    return entry
  }

  private ensureLoaded(entry: CacheEntry): Promise<unknown> {
    if (entry.state === 'ready') return Promise.resolve(entry.resource)
    if (entry.loading) return entry.loading
    entry.state = 'loading'
    entry.loading = this.loader.load(entry.definition)
      .then((resource) => {
        entry.resource = resource
        entry.resourceLoaded = true
        entry.state = 'ready'
        entry.loading = null
        if (entry.references === 0) this.disposeEntry(entry)
        return resource
      })
      .catch((error: unknown) => {
        entry.loading = null
        entry.state = 'error'
        entry.error = error instanceof Error ? error.message : '资源加载失败。'
        if (entry.references === 0) this.cache.delete(String(entry.definition.id))
        throw error
      })
    return entry.loading
  }

  private releaseEntry(entry: CacheEntry): void {
    entry.references = Math.max(0, entry.references - 1)
    if (entry.references === 0 && !entry.loading) this.disposeEntry(entry)
  }

  private disposeEntry(entry: CacheEntry): void {
    if (entry.resourceLoaded && entry.resource !== undefined) this.loader.release?.(entry.definition, entry.resource)
    this.cache.delete(String(entry.definition.id))
  }
}

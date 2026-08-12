import type {
  DialogueCopyPatch,
  DialogueEnrichContext,
  MemeDensity,
  NarrationContext,
  TextGenContext,
  TextProvider,
  TextResult,
} from '../../types/text-provider'
import type { MemeDefinition } from '../../types/meme'
import { MemeDirector } from '../comedy/MemeDirector'

const NARRATION_LINES: Record<NarrationContext['trigger'], readonly string[]> = {
  idle: ['江湖很大，先把菜刀擦亮也算修行。'],
  skip_dialogue: ['你把客套话收进袖子里，江湖效率暂时提升。'],
  battle_fail: ['挨打不丢人，丢人的是没记住白大侠的出招。'],
  battle_win: ['这一刀讲道理，连对手都决定先听你说完。'],
  quest_complete: ['账本又添一笔：事情办成，报酬暂且没有跑。'],
  npc_harass: ['你又点了一遍，对方开始考虑收取咨询费。'],
  title_unlock: ['新称号入账，江湖名册暂时没有拒收。'],
  load: ['旧日江湖重新开张，菜刀和勇气都还在。'],
  custom: ['说书人翻了翻账本：这事儿确实值得记一笔。'],
}

const DENSITY_SUFFIX: Record<MemeDensity, string> = {
  mild: '',
  standard: '——稳住，别让菜刀先有情绪。',
  spicy: '——显眼包气质已到账，但主线不会因此迷路。',
}

const MAX_NARRATION_LENGTH = 240
const MAX_DIALOGUE_LABEL_LENGTH = 80

function plainText(value: string, maxLength: number): string {
  const withoutMarkup = value.replace(/[<>]/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim()
  const safe = withoutMarkup || '江湖暂时没有补充说明。'
  return Array.from(safe).slice(0, Math.max(1, maxLength)).join('')
}

function valueText(value: unknown): string {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string').join('、')
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function densitySuffix(density: MemeDensity): string {
  return DENSITY_SUFFIX[density] ?? DENSITY_SUFFIX.mild
}

function stableSeed(value: string): number {
  let seed = 2166136261
  for (const character of value) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619)
  return seed >>> 0
}

export class LocalTextProvider implements TextProvider {
  private readonly seen = new Map<string, number>()
  private readonly memeDirector: MemeDirector | null

  constructor(memePack: readonly MemeDefinition[] = []) {
    this.memeDirector = memePack.length > 0 ? new MemeDirector(memePack) : null
  }

  getNarration(ctx: NarrationContext): TextResult<string> {
    const requestId = ctx.requestId.trim() || 'local:narration'
    const lines = NARRATION_LINES[ctx.trigger] ?? NARRATION_LINES.custom
    const key = `${ctx.trigger}:${ctx.memeDensity}`
    const cursor = this.seen.get(key) ?? 0
    this.seen.set(key, cursor + 1)
    const meme = this.memeDirector?.select(
      { id: `meme:${requestId}`, type: ctx.trigger, payload: {}, occurredAtTick: cursor, sourceActionId: requestId },
      { density: ctx.memeDensity, tags: ctx.player.recentActionTags, tick: cursor, actionId: requestId, rngState: stableSeed(requestId) },
    )
    const supplement = meme?.text ?? densitySuffix(ctx.memeDensity)
    const line = `${lines[cursor % lines.length]}${supplement ? ` ${supplement}` : ''}`
    return { value: plainText(line, MAX_NARRATION_LENGTH), source: 'local', requestId }
  }

  enrichDialogueCopy(ctx: DialogueEnrichContext): TextResult<DialogueCopyPatch[]> {
    const requestId = ctx.requestId.trim() || 'local:dialogue'
    const patches: DialogueCopyPatch[] = ctx.authoredOptions.map((option) => {
      const suffix = ctx.memeDensity === 'mild' ? '' : ctx.memeDensity === 'spicy' ? '（这选项看着就很有戏）' : '（稳妥中带一点江湖味）'
      return { optionId: option.optionId, label: plainText(`${option.semanticTag || '继续'}${suffix}`, MAX_DIALOGUE_LABEL_LENGTH) }
    })
    return { value: patches, source: 'local', requestId }
  }

  generateText(ctx: TextGenContext): TextResult<string> {
    const requestId = ctx.requestId.trim() || 'local:generated'
    const subject = valueText(ctx.safeData.subject ?? ctx.safeData.item ?? ctx.safeData.enemy ?? '这件江湖小事')
    const result = {
      battle_report: `战报：${subject}已经收刀，胜负记录清楚，${valueText(ctx.safeData.turns ?? '若干')}回合后双方都想喝水。`,
      commission_desc: `委托：请处理${subject}，奖励按账本结算，路上可以顺便观察风向。`,
      disciple_report: `门人汇报：${subject}已完成派遣，过程有点曲折，结果没有离谱。`,
      idle_thought: `闲想：如果把${subject}切成薄片，或许能更快想明白。`,
      item_flavor: `物品风味：${subject}看起来普通，拿在菜刀侠手里就开始有故事。`,
    }[ctx.type as TextGenContext['type']] ?? `本地文本：${subject}暂时没有专属模板。`
    return { value: plainText(`${result}${densitySuffix(ctx.memeDensity)}`, Math.max(1, Math.min(ctx.maxLength, 480))), source: 'local', requestId }
  }

  clearSeen(): void {
    this.seen.clear()
    this.memeDirector?.reset()
  }
}

export function createLocalTextProvider(memePack: readonly MemeDefinition[] = []): LocalTextProvider {
  return new LocalTextProvider(memePack)
}

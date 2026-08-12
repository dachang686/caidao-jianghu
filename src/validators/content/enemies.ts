import type { ChapterEnemyDefinition } from '../../types/chapter-combat'

export type ChapterEnemyValidationIssueCode = 'duplicate_id' | 'missing_reference' | 'invalid_value'

export interface ChapterEnemyValidationIssue {
  readonly code: ChapterEnemyValidationIssueCode
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface ChapterEnemyValidationResult {
  readonly valid: boolean
  readonly issues: readonly ChapterEnemyValidationIssue[]
}

function issue(issues: ChapterEnemyValidationIssue[], code: ChapterEnemyValidationIssueCode, path: string, message: string, id?: string): void {
  issues.push({ code, path, message, ...(id ? { id } : {}) })
}

export function validateChapterEnemyDefinitions(
  definitions: readonly ChapterEnemyDefinition[],
  chapterId: string,
): ChapterEnemyValidationResult {
  const issues: ChapterEnemyValidationIssue[] = []
  const seenIds = new Set<string>()
  let normalCount = 0
  let bossCount = 0

  definitions.forEach((enemy, enemyIndex) => {
    const path = `enemies[${enemyIndex}]`
    const id = String(enemy.id)
    if (seenIds.has(id)) issue(issues, 'duplicate_id', `${path}.id`, `重复敌人 ID「${id}」`, id)
    seenIds.add(id)
    if (String(enemy.chapterId) !== chapterId) issue(issues, 'invalid_value', `${path}.chapterId`, '敌人所属章节不匹配', id)
    if (!enemy.name.trim()) issue(issues, 'invalid_value', `${path}.name`, '敌人名称不能为空', id)
    if (!enemy.readableIntent) issue(issues, 'invalid_value', `${path}.readableIntent`, 'Core 敌人必须声明可读意图', id)
    if (enemy.role === 'normal') normalCount += 1
    if (enemy.role === 'boss') bossCount += 1
    if (!enemy.moves.length) issue(issues, 'invalid_value', `${path}.moves`, '敌人至少需要一组招式', id)

    const moveIds = new Set<string>()
    enemy.moves.forEach((move, moveIndex) => {
      const movePath = `${path}.moves[${moveIndex}]`
      if (moveIds.has(move.id)) issue(issues, 'duplicate_id', `${movePath}.id`, `重复招式 ID「${move.id}」`, move.id)
      moveIds.add(move.id)
      if (!move.name.trim() || !move.summary.trim()) issue(issues, 'invalid_value', movePath, '招式名称和诚实意图说明不能为空', move.id)
    })
    enemy.behavior.moveIds.forEach((moveId, moveIndex) => {
      if (!moveIds.has(moveId)) issue(issues, 'missing_reference', `${path}.behavior.moveIds[${moveIndex}]`, `找不到招式「${moveId}」`, moveId)
    })
    if (enemy.behavior.fallbackMoveId && !moveIds.has(enemy.behavior.fallbackMoveId)) {
      issue(issues, 'missing_reference', `${path}.behavior.fallbackMoveId`, `找不到兜底招式「${enemy.behavior.fallbackMoveId}」`, enemy.behavior.fallbackMoveId)
    }
    if ((enemy.specialRuleIds?.length ?? 0) > 1) issue(issues, 'invalid_value', `${path}.specialRuleIds`, 'Boss 最多只能有一个专属反套路规则', id)

    if (enemy.role === 'boss') {
      const phases = enemy.boss?.phases ?? []
      if (phases.length < 2) issue(issues, 'invalid_value', `${path}.boss.phases`, '章节 Boss 至少需要两个可读阶段', id)
      const phaseIds = new Set<string>()
      phases.forEach((phase, phaseIndex) => {
        const phasePath = `${path}.boss.phases[${phaseIndex}]`
        if (phaseIds.has(phase.id)) issue(issues, 'duplicate_id', `${phasePath}.id`, `重复 Boss 阶段 ID「${phase.id}」`, phase.id)
        phaseIds.add(phase.id)
        if (phase.deceptiveChance !== undefined && (phase.deceptiveChance < 0 || phase.deceptiveChance > 0.2)) {
          issue(issues, 'invalid_value', `${phasePath}.deceptiveChance`, 'Boss 虚实欺骗概率不得超过 20%', phase.id)
        }
        phase.moveIds?.forEach((moveId, moveIndex) => {
          if (!moveIds.has(moveId)) issue(issues, 'missing_reference', `${phasePath}.moveIds[${moveIndex}]`, `找不到阶段招式「${moveId}」`, moveId)
        })
      })
      if (!enemy.presentationCueIds?.length) issue(issues, 'missing_reference', `${path}.presentationCueIds`, 'Boss 必须声明至少一个专属演出 cue', id)
    } else if (enemy.boss) {
      issue(issues, 'invalid_value', `${path}.boss`, '普通敌人不能配置 Boss 阶段', id)
    }
  })

  if (normalCount < 2) issue(issues, 'invalid_value', 'enemies', `章节普通敌人至少需要 2 类，当前为 ${normalCount}`, chapterId)
  if (bossCount < 1) issue(issues, 'invalid_value', 'enemies', '章节必须配置一个 Boss', chapterId)
  return { valid: issues.length === 0, issues }
}

export function assertValidChapterEnemyDefinitions(definitions: readonly ChapterEnemyDefinition[], chapterId: string): void {
  const result = validateChapterEnemyDefinitions(definitions, chapterId)
  if (!result.valid) throw new Error(`章节敌人内容校验失败：${result.issues.map((item) => `${item.path} ${item.message}`).join('；')}`)
}

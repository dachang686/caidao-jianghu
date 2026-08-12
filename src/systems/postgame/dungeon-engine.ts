import type { PostgameDungeonAdvanceResult, PostgameDungeonDefinition, PostgameDungeonState } from '../../types/postgame-dungeon'

function cloneState(state: PostgameDungeonState): PostgameDungeonState {
  return { ...state, completedDungeonIds: [...state.completedDungeonIds], claimedGrantKeys: [...state.claimedGrantKeys], processedActionIds: [...state.processedActionIds] }
}

export function createPostgameDungeonState(overrides: Partial<PostgameDungeonState> = {}): PostgameDungeonState {
  return { unlocked: false, activeDungeonId: null, encounterIndex: 0, checkpointIndex: 0, completedDungeonIds: [], claimedGrantKeys: [], processedActionIds: [], ...overrides }
}

export class PostgameDungeonEngine {
  private readonly definitions: ReadonlyMap<string, PostgameDungeonDefinition>
  private state: PostgameDungeonState

  constructor(definitions: readonly PostgameDungeonDefinition[], snapshot?: Partial<PostgameDungeonState>) {
    this.definitions = new Map(definitions.map((definition) => [definition.id, definition]))
    this.state = createPostgameDungeonState(snapshot)
  }

  getState(): PostgameDungeonState { return cloneState(this.state) }

  unlock(): PostgameDungeonEngine {
    this.state = { ...this.state, unlocked: true }
    return this
  }

  start(dungeonId: string, actionId = `dungeon:start:${dungeonId}`): PostgameDungeonAdvanceResult {
    const dungeon = this.definitions.get(dungeonId)
    if (!this.state.unlocked) return { status: 'locked', state: this.getState(), message: '通关后秘境需要先完成一个合法结局。', firstClear: false }
    if (!dungeon) return { status: 'unknown_dungeon', state: this.getState(), message: '秘境不存在。', firstClear: false }
    if (this.state.processedActionIds.includes(actionId)) return { status: 'already_processed', state: this.getState(), message: '该秘境操作已经处理过。', firstClear: false }
    this.state = { ...this.state, activeDungeonId: dungeon.id, encounterIndex: 0, checkpointIndex: 0, processedActionIds: [...this.state.processedActionIds, actionId] }
    return { status: 'started', state: this.getState(), message: `${dungeon.title}已进入，失败只回到安全节点。`, encounter: dungeon.encounters[0], firstClear: false }
  }

  advance(outcome: 'victory' | 'defeat' | 'exit', actionId: string): PostgameDungeonAdvanceResult {
    if (this.state.processedActionIds.includes(actionId)) return { status: 'already_processed', state: this.getState(), message: '该秘境结算已经处理过。', firstClear: false }
    const dungeon = this.state.activeDungeonId ? this.definitions.get(this.state.activeDungeonId) : undefined
    if (!dungeon) return { status: 'unknown_dungeon', state: this.getState(), message: '当前没有进行中的秘境。', firstClear: false }
    const current = dungeon.encounters[this.state.encounterIndex]
    if (!current) return { status: 'invalid_outcome', state: this.getState(), message: '秘境节点不存在。', firstClear: false }
    const nextActions = [...this.state.processedActionIds, actionId]
    if (outcome === 'defeat') {
      this.state = { ...this.state, encounterIndex: this.state.checkpointIndex, processedActionIds: nextActions }
      return { status: 'defeat_checkpoint', state: this.getState(), message: '挑战失败，核心装备和主线存档保持不变，已回到安全节点。', encounter: dungeon.encounters[this.state.encounterIndex], firstClear: false }
    }
    if (outcome === 'exit') {
      if (!current.canExitAfter) return { status: 'invalid_outcome', state: this.getState(), message: '当前节点还不能退出，先完成这一场遭遇。', firstClear: false }
      this.state = { ...this.state, activeDungeonId: null, processedActionIds: nextActions }
      return { status: 'exited', state: this.getState(), message: '已在可退出节点安全离开秘境。', firstClear: false }
    }
    const nextIndex = this.state.encounterIndex + 1
    if (nextIndex >= dungeon.encounters.length) {
      const firstClear = !this.state.completedDungeonIds.includes(dungeon.id)
      this.state = { ...this.state, activeDungeonId: null, encounterIndex: 0, checkpointIndex: 0, completedDungeonIds: firstClear ? [...this.state.completedDungeonIds, dungeon.id] : [...this.state.completedDungeonIds], claimedGrantKeys: firstClear ? [...this.state.claimedGrantKeys, dungeon.firstClearGrantKey] : [...this.state.claimedGrantKeys], processedActionIds: nextActions }
      return { status: 'completed', state: this.getState(), message: firstClear ? `${dungeon.title}首通完成，奖励已记录。` : `${dungeon.title}重复完成，收益按 ${dungeon.repeatRewardMultiplier} 倍回落。`, firstClear }
    }
    this.state = { ...this.state, encounterIndex: nextIndex, checkpointIndex: nextIndex, processedActionIds: nextActions }
    return { status: 'advanced', state: this.getState(), message: `${current.title}完成，已写入安全节点。`, encounter: dungeon.encounters[nextIndex], firstClear: false }
  }
}

export function createPostgameDungeonEngine(definitions: readonly PostgameDungeonDefinition[], snapshot?: Partial<PostgameDungeonState>): PostgameDungeonEngine {
  return new PostgameDungeonEngine(definitions, snapshot)
}


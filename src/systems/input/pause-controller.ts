export interface PauseSnapshot {
  readonly paused: boolean
  readonly reason: 'boss-key' | null
  readonly focusToken: string | null
}

export class PauseController {
  private snapshotState: PauseSnapshot = { paused: false, reason: null, focusToken: null }

  snapshot(): PauseSnapshot { return { ...this.snapshotState } }

  enter(reason: 'boss-key' = 'boss-key', focusToken: string | null = null): PauseSnapshot {
    this.snapshotState = { paused: true, reason, focusToken }
    return this.snapshot()
  }

  exit(): PauseSnapshot {
    this.snapshotState = { paused: false, reason: null, focusToken: this.snapshotState.focusToken }
    return this.snapshot()
  }

  toggle(focusToken: string | null = null): PauseSnapshot {
    return this.snapshotState.paused ? this.exit() : this.enter('boss-key', focusToken)
  }

  isPaused(): boolean { return this.snapshotState.paused }
}

export const createPauseController = (): PauseController => new PauseController()

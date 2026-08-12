// 对话引擎只消费声明式节点；LocalTextProvider 只能改写已存在选项的表现文本。
export {
  DialogueEngine,
  DialogueEngineError,
  DialogueSnapshotError,
  applyDialogueCopyPatches,
  assertValidDialogueGraph,
  createDialogueEngine,
  parseDialogueSnapshot,
  restoreDialogueSnapshot,
  serializeDialogueSnapshot,
  validateDialogueGraph,
} from './engine'

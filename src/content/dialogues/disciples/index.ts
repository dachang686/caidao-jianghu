import { asChoiceId, asDialogueId } from '../../../types/ids'
import type { DialogueNode } from '../../../types/dialogue'

interface DiscipleDialogueCopy {
  readonly slug: string
  readonly recruit: string
  readonly short: string
}

function createDialoguePair(copy: DiscipleDialogueCopy): readonly DialogueNode[] {
  const recruitId = asDialogueId(`dialogue:disciple:${copy.slug}:recruit`)
  const shortId = asDialogueId(`dialogue:disciple:${copy.slug}:short`)
  return [
    {
      id: recruitId,
      text: copy.recruit,
      choices: [{ id: asChoiceId(`choice:disciple:${copy.slug}:recruit`), label: '把名册递过去', nextNodeId: shortId }],
    },
    { id: shortId, text: copy.short, choices: [] },
  ]
}

export const discipleDialogueDefinitions: readonly DialogueNode[] = [
  ...createDialoguePair({ slug: 'shy', recruit: '沈算盘把写满路线的纸折成四折： “我可以入门，但请把招呼我的流程写下来，临场发挥会让我手心出汗。”', short: '派遣回来后，沈算盘先把账本推过来：“我没有不说话，只是把结论按轻重缓急排好了。”' }),
  ...createDialoguePair({ slug: 'showoff', recruit: '陆显眼在门口清了三次嗓子： “听说贵派缺一个能让消息自己长腿的人？我已经替你们宣布了。”', short: '派遣归来，陆显眼把一张普通纸条举过头顶：“看，整个驿站都知道我们完成了！”' }),
  ...createDialoguePair({ slug: 'forge', recruit: '唐铁衣拎着一把缺口短刀： “我不敢保证每把兵器都漂亮，但我保证它们不会带着螺丝去闯江湖。”', short: '她检查完派遣物资才肯坐下：“锤子归位，火候合格，谁也别想把修补说成奇迹。”' }),
  ...createDialoguePair({ slug: 'kitchen', recruit: '灶边小满端来一碗看不出原形的汤： “别问名字，先问饱不饱。若还想要名字，我再给它起个响亮的。”', short: '她给队伍分好路粮：“每个人一份，连显眼包也不能多拿。饿肚子不算江湖试炼。”' }),
  ...createDialoguePair({ slug: 'listener', recruit: '叶听风在屋檐下听完三阵风，才轻声说： “你们说的事，我大概已经听见一半了；剩下一半在渡口。”', short: '她把三句闲话压成一条线索：“不用追着所有人问，先去找那个说漏嘴的人。”' }),
  ...createDialoguePair({ slug: 'manager', recruit: '顾全账抱着门派账本来投名： “我不争掌门，只争每一笔花费都能在账上找到回声。”', short: '他把派遣结算分成收入、消耗、预留三栏：“这次赚没赚，先别靠气势判断。”' }),
]

export const CORE_DISCIPLE_DIALOGUES = discipleDialogueDefinitions

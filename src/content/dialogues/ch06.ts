import { asChoiceId, asContentKey, asDialogueId, asNpcId } from '../../types/ids'
import type { DialogueGraph, DialogueNode } from '../../types/dialogue'
import type { MemeDensity } from '../../types/text-provider'

const boatwoman = asNpcId('donghai-boatwoman'); const vendor = asNpcId('donghai-shell-vendor'); const bell = asNpcId('donghai-tide-bell-keeper')
const id = (value: string) => asDialogueId(`dialogue:ch06:${value}`)
const choice = (slug: string, label: string, nextNodeId?: DialogueNode['id'], options: Partial<DialogueNode['choices'][number]> = {}) => ({ id: asChoiceId(`choice:ch06:${slug}`), label, ...(nextNodeId ? { nextNodeId } : {}), ...options })
const hub = id('hub'); const boatNode = id('boatwoman'); const boatClue = id('boatwoman:clue'); const boatDetour = id('boatwoman:detour'); const vendorNode = id('shell-vendor'); const vendorClue = id('shell-vendor:clue'); const vendorDetour = id('shell-vendor:detour'); const bellNode = id('tide-bell-keeper'); const bellClue = id('tide-bell-keeper:clue'); const bellDetour = id('tide-bell-keeper:detour'); const review = id('review:confirm')

export const ch06DialogueDefinitions: readonly DialogueNode[] = [
  { id: hub, speakerNpcId: boatwoman, text: '东海镇的潮水每天换一套说法。海棠说留影石带货乱象的第一条证据，是船单上每一处被水泡开的夸张。', choices: [choice('hub-boat', '问海棠船单', boatNode), choice('hub-shell', '去贝壳市场', vendorNode), choice('hub-bell', '到潮声寺听钟', bellNode)] },
  { id: boatNode, speakerNpcId: boatwoman, text: '海棠摊开船单：“这班船装鱼，那班船装贝壳，还有一班船只装热度。你猜哪班最容易超载？”', choices: [choice('boat-clue', '请她指出真实潮船', boatClue), choice('boat-detour', '先把留影石按海鲜计价', boatDetour, { branch: 'confusing', returnToNodeId: boatNode })] },
  { id: boatClue, speakerNpcId: boatwoman, text: '船单上的盐痕指向东二泊位。海棠说真正的货物会留下重量，带货文案只留下回音。', choices: [choice('boat-back', '把泊位记进案卷', hub, { effects: [{ type: 'set_flag', flag: 'ch06_boat_seen', value: true }] }), choice('boat-review', '把船单交潮声寺备案', review, { irreversible: true, requiresConfirmation: true, effects: [{ type: 'set_flag', flag: 'ch06_review_notice', value: true }] })] },
  { id: boatDetour, speakerNpcId: boatwoman, text: '海棠摇头：“海鲜至少会腐，夸张却能常温保存。别让它占了整条船。”', choices: [choice('boat-detour-back', '回到船单核对', boatNode, { branch: 'confusing', returnToNodeId: boatNode })] },
  { id: vendorNode, speakerNpcId: vendor, text: '贝小满给贝壳打光：“留影石只要照到浪花，就敢自称见过海龙。我的贝壳至少不会给自己加滤镜。”', choices: [choice('vendor-clue', '请他说明留影石来源', vendorClue), choice('vendor-detour', '问贝壳能不能直播带货', vendorDetour, { branch: 'confusing', returnToNodeId: vendorNode })] },
  { id: vendorClue, speakerNpcId: vendor, text: '贝小满指出一枚盐渍最重的贝壳：“这枚来自东二泊位，和海棠的船单能对上。证据比滤镜耐用。”', choices: [choice('vendor-back', '把贝壳证据记进案卷', hub, { effects: [{ type: 'set_flag', flag: 'ch06_vendor_seen', value: true }] })] },
  { id: vendorDetour, speakerNpcId: vendor, text: '贝小满说：“能，但我只直播贝壳的反光，不直播它对自己身世的想象。”', choices: [choice('vendor-detour-back', '回到留影石来源', vendorNode, { branch: 'confusing', returnToNodeId: vendorNode })] },
  { id: bellNode, speakerNpcId: bell, text: '潮生抱着潮钟：“第一声报潮，第二声报平安，第三声报某人又把证据剪成了三段。”', choices: [choice('bell-clue', '请他核对潮汐记录', bellClue), choice('bell-detour', '先问潮钟能否当主播', bellDetour, { branch: 'confusing', returnToNodeId: bellNode })] },
  { id: bellClue, speakerNpcId: bell, text: '潮汐记录显示涨潮时无人能在东二泊位装满三船热度。潮生说，潮水不懂营销，却很懂时间。', choices: [choice('bell-back', '把潮汐记录记入案卷', hub, { effects: [{ type: 'set_flag', flag: 'ch06_bell_seen', value: true }] })] },
  { id: bellDetour, speakerNpcId: bell, text: '潮生说：“潮钟只播时间，不播观点。若它开始带货，我会先把它关进仓库。”', choices: [choice('bell-detour-back', '回到潮汐记录', bellNode, { branch: 'confusing', returnToNodeId: bellNode })] },
  { id: review, speakerNpcId: bell, text: '潮生把船单、贝壳和潮汐记录放在钟下：“确认把这份证据公开备案吗？潮水会继续涨落，但记录不会替夸张辩护。”', choices: [choice('review-confirm', '确认，让潮声替事实报时', hub)] },
]
export const CH06_DIALOGUE_GRAPH: DialogueGraph = { id: 'dialogue:ch06', startNodeId: hub, nodes: ch06DialogueDefinitions, mainlineNodeIds: [hub, boatNode, boatClue, vendorNode, vendorClue, bellNode, bellClue, review], maxConfusingHops: 2 }
export const CH06_DENSITY_COPY: Readonly<Record<MemeDensity, readonly string[]>> = { mild: ['潮水有记录，文案也该有出处。', '贝小满说贝壳不替自己加滤镜。'], standard: ['船单被盐水泡开，只有夸张部分还保持防水。', '潮生敲钟三下，提醒大家别把剪辑当成潮汐。'], spicy: ['东海带货榜：浪花第一，证据暂未入榜。', '贝壳拒绝直播，因为它已经反光过度。', '潮钟今日播报：时间上涨，热度不一定。'] }
export const CH06_MODERN_MAPPING_LINES: readonly string[] = ['东海带货榜：浪花第一，证据暂未入榜。']
export const CH06_DIALOGUE_COPY_KEYS = { entry: asContentKey('line:ch06:ship-log'), stone: asContentKey('line:ch06:light-stone'), bossReady: asContentKey('line:ch06:boss-ready') } as const
export const CORE_CH06_DIALOGUES = ch06DialogueDefinitions

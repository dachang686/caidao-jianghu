import type { ContentManifest } from '../types/content'
import { asChapterId, asContentKey, asLocationId, asWorldRegionId } from '../types/ids'
import { CORE_ASSET_MANIFEST } from './assets'
import { CH02_ENTRY_CONDITION, CH02_LOCKED_REASON } from './chapters/ch02-entry'
import { CH03_ENTRY_CONDITION, CH03_LOCKED_REASON } from './chapters/ch03-entry'
import { CH04_ENTRY_CONDITION, CH04_LOCKED_REASON } from './chapters/ch04-entry'
import { CH05_ENTRY_CONDITION, CH05_LOCKED_REASON } from './chapters/ch05-entry'
import { CH06_ENTRY_CONDITION, CH06_LOCKED_REASON } from './chapters/ch06-entry'
import { CH07_ENTRY_CONDITION, CH07_LOCKED_REASON } from './chapters/ch07-entry'
import { CH08_ENTRY_CONDITION, CH08_LOCKED_REASON } from './chapters/ch08-entry'

const chapterOneResource = './chapters/ch01'
const chapterTwoResource = './chapters/ch02'
const chapterThreeResource = './chapters/ch03'
const chapterFourResource = './chapters/ch04'
const chapterFiveResource = './chapters/ch05'
const chapterSixResource = './chapters/ch06'
const chapterSevenResource = './chapters/ch07'
const chapterEightResource = './chapters/ch08'
const xiaoyuVillageRegionId = asWorldRegionId('xiaoyu-village')
const xiaoyuVillageLocationId = asLocationId('xiaoyu-village')
const qingheRegionId = asWorldRegionId('qinghe-county')
const qingheMarketLocationId = asLocationId('qinghe-market')
const qingheRiverfrontLocationId = asLocationId('qinghe-riverfront')
const blackwindRegionId = asWorldRegionId('blackwind-fortress')
const blackwindGateLocationId = asLocationId('blackwind-gate')
const blackwindKitchenLocationId = asLocationId('blackwind-kitchen')
const blackwindWatchtowerLocationId = asLocationId('blackwind-watchtower')
const qingyunRegionId = asWorldRegionId('qingyun-mountain')
const qingyunGateLocationId = asLocationId('qingyun-gate')
const qingyunHerbGardenLocationId = asLocationId('qingyun-herb-garden')
const qingyunBellTerraceLocationId = asLocationId('qingyun-bell-terrace')
const westernRelayRegionId = asWorldRegionId('western-relay')
const westernRelayLocationId = asLocationId('western-relay-station')
const westernDuneLocationId = asLocationId('western-dune-supply')
const westernCaravanLocationId = asLocationId('western-caravan-yard')
const donghaiRegionId = asWorldRegionId('donghai-town')
const donghaiPortLocationId = asLocationId('donghai-port')
const donghaiMarketLocationId = asLocationId('donghai-shell-market')
const donghaiTempleLocationId = asLocationId('donghai-tide-temple')
const capitalRankingRegionId = asWorldRegionId('capital-ranking')
const capitalGateLocationId = asLocationId('capital-gate')
const capitalOfficeLocationId = asLocationId('capital-ranking-office')
const capitalArchiveLocationId = asLocationId('capital-archive')
const martialConventionRegionId = asWorldRegionId('martial-convention')
const conventionGateLocationId = asLocationId('convention-gate')
const conventionStageLocationId = asLocationId('convention-stage')
const conventionKitchenLocationId = asLocationId('convention-kitchen')

export const contentManifest: ContentManifest = {
  version: 1,
  assetManifest: CORE_ASSET_MANIFEST,
  regions: [
    {
      id: xiaoyuVillageRegionId,
      chapterId: asChapterId('ch01'),
      title: '小愚村',
      order: 1,
      entryLocationId: xiaoyuVillageLocationId,
      locationIds: [xiaoyuVillageLocationId],
      resourceEntry: chapterOneResource,
    },
    {
      id: qingheRegionId,
      chapterId: asChapterId('ch02'),
      title: '清河县',
      order: 2,
      entryLocationId: qingheMarketLocationId,
      locationIds: [qingheMarketLocationId, qingheRiverfrontLocationId],
      resourceEntry: chapterTwoResource,
      entryCondition: CH02_ENTRY_CONDITION,
      lockedReason: CH02_LOCKED_REASON,
    },
    {
      id: blackwindRegionId,
      chapterId: asChapterId('ch03'),
      title: '黑风寨',
      order: 3,
      entryLocationId: blackwindGateLocationId,
      locationIds: [blackwindGateLocationId, blackwindKitchenLocationId, blackwindWatchtowerLocationId],
      resourceEntry: chapterThreeResource,
      entryCondition: CH03_ENTRY_CONDITION,
      lockedReason: CH03_LOCKED_REASON,
    },
    {
      id: qingyunRegionId,
      chapterId: asChapterId('ch04'),
      title: '青云山',
      order: 4,
      entryLocationId: qingyunGateLocationId,
      locationIds: [qingyunGateLocationId, qingyunHerbGardenLocationId, qingyunBellTerraceLocationId],
      resourceEntry: chapterFourResource,
      entryCondition: CH04_ENTRY_CONDITION,
      lockedReason: CH04_LOCKED_REASON,
    },
    { id: westernRelayRegionId, chapterId: asChapterId('ch05'), title: '西域驿路', order: 5, entryLocationId: westernRelayLocationId, locationIds: [westernRelayLocationId, westernDuneLocationId, westernCaravanLocationId], resourceEntry: chapterFiveResource, entryCondition: CH05_ENTRY_CONDITION, lockedReason: CH05_LOCKED_REASON },
    { id: donghaiRegionId, chapterId: asChapterId('ch06'), title: '东海镇', order: 6, entryLocationId: donghaiPortLocationId, locationIds: [donghaiPortLocationId, donghaiMarketLocationId, donghaiTempleLocationId], resourceEntry: chapterSixResource, entryCondition: CH06_ENTRY_CONDITION, lockedReason: CH06_LOCKED_REASON },
    { id: capitalRankingRegionId, chapterId: asChapterId('ch07'), title: '京城', order: 7, entryLocationId: capitalGateLocationId, locationIds: [capitalGateLocationId, capitalOfficeLocationId, capitalArchiveLocationId], resourceEntry: chapterSevenResource, entryCondition: CH07_ENTRY_CONDITION, lockedReason: CH07_LOCKED_REASON },
    { id: martialConventionRegionId, chapterId: asChapterId('ch08'), title: '武林大会', order: 8, entryLocationId: conventionGateLocationId, locationIds: [conventionGateLocationId, conventionStageLocationId, conventionKitchenLocationId], resourceEntry: chapterEightResource, entryCondition: CH08_ENTRY_CONDITION, lockedReason: CH08_LOCKED_REASON },
  ],
  chapters: [
    {
      id: asChapterId('ch01'),
      title: '小愚村',
      order: 1,
      entryLocationId: asLocationId('xiaoyu-village'),
      resourceEntry: chapterOneResource,
    },
    {
      id: asChapterId('ch02'),
      title: '清河县',
      order: 2,
      entryLocationId: qingheMarketLocationId,
      resourceEntry: chapterTwoResource,
    },
    {
      id: asChapterId('ch03'),
      title: '黑风寨',
      order: 3,
      entryLocationId: blackwindGateLocationId,
      resourceEntry: chapterThreeResource,
    },
    {
      id: asChapterId('ch04'),
      title: '青云山',
      order: 4,
      entryLocationId: qingyunGateLocationId,
      resourceEntry: chapterFourResource,
    },
    { id: asChapterId('ch05'), title: '西域驿路', order: 5, entryLocationId: westernRelayLocationId, resourceEntry: chapterFiveResource },
    { id: asChapterId('ch06'), title: '东海镇', order: 6, entryLocationId: donghaiPortLocationId, resourceEntry: chapterSixResource },
    { id: asChapterId('ch07'), title: '京城', order: 7, entryLocationId: capitalGateLocationId, resourceEntry: chapterSevenResource },
    { id: asChapterId('ch08'), title: '武林大会', order: 8, entryLocationId: conventionGateLocationId, resourceEntry: chapterEightResource },
  ],
  resourceEntrypoints: [
    {
      key: asContentKey('chapter:ch01'),
      path: chapterOneResource,
      kind: 'chapter',
    },
    {
      key: asContentKey('region:xiaoyu-village'),
      path: chapterOneResource,
      kind: 'region',
    },
    {
      key: asContentKey('chapter:ch02'),
      path: chapterTwoResource,
      kind: 'chapter',
    },
    {
      key: asContentKey('region:qinghe-county'),
      path: chapterTwoResource,
      kind: 'region',
    },
    {
      key: asContentKey('chapter:ch03'),
      path: chapterThreeResource,
      kind: 'chapter',
    },
    {
      key: asContentKey('region:blackwind-fortress'),
      path: chapterThreeResource,
      kind: 'region',
    },
    {
      key: asContentKey('chapter:ch04'),
      path: chapterFourResource,
      kind: 'chapter',
    },
    {
      key: asContentKey('region:qingyun-mountain'),
      path: chapterFourResource,
      kind: 'region',
    },
    { key: asContentKey('chapter:ch05'), path: chapterFiveResource, kind: 'chapter' },
    { key: asContentKey('region:western-relay'), path: chapterFiveResource, kind: 'region' },
    { key: asContentKey('chapter:ch06'), path: chapterSixResource, kind: 'chapter' },
    { key: asContentKey('region:donghai-town'), path: chapterSixResource, kind: 'region' },
    { key: asContentKey('chapter:ch07'), path: chapterSevenResource, kind: 'chapter' },
    { key: asContentKey('region:capital-ranking'), path: chapterSevenResource, kind: 'region' },
    { key: asContentKey('chapter:ch08'), path: chapterEightResource, kind: 'chapter' },
    { key: asContentKey('region:martial-convention'), path: chapterEightResource, kind: 'region' },
    ...CORE_ASSET_MANIFEST.assets.map((asset) => ({
      key: asContentKey(`asset:${String(asset.id)}`),
      path: asset.src,
      kind: 'asset' as const,
    })),
  ],
}

export const CONTENT_MANIFEST = contentManifest

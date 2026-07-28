import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const readSource = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8')

const componentSource = readSource('src/components/interviews/MockInterviewPositionCard.vue')
const componentCompact = componentSource.replace(/\s+/g, ' ')

for (const prop of ['title', 'industry', 'salary', 'city', 'availabilityLabel', 'selected']) {
  assert.match(componentSource, new RegExp(`\\b${prop}\\??:`), `共享职位卡片必须声明 ${prop} prop`)
}

assert.equal(
  componentSource.includes("(event: 'select'): void"),
  true,
  '共享职位卡片必须只向页面发出 select 事件',
)
assert.equal(
  componentSource.includes("{{ city || '全国' }}"),
  true,
  '城市为空时必须由共享职位卡片统一显示全国',
)
assert.equal(
  componentSource.includes('v-if="availabilityLabel"'),
  true,
  '共享职位卡片必须只在页面传入到岗文案时渲染该行',
)
assert.match(
  componentCompact,
  /\.position-content \{ flex: 1 1 0; width: 0; min-width: 0;/,
  '职位内容区必须允许从零收缩，不能挤压卡片边界',
)
assert.match(
  componentCompact,
  /\.position-paired-row \{ display: flex; width: 100%; min-width: 0; align-items: flex-start;/,
  '每一行必须使用同一个成对布局容器对齐左右字段',
)
assert.match(
  componentCompact,
  /\.position-copy \{ flex: 1 1 0; width: 0; min-width: 0;/,
  '职位文案列必须允许从零收缩，不能挤压右侧元数据列',
)
assert.match(
  componentCompact,
  /\.position-title \{[\s\S]*max-width: 100%;[\s\S]*overflow-wrap: anywhere;[\s\S]*word-break: break-all;/,
  '职位标题必须限制自身宽度，并允许无分隔长英文断行',
)
assert.equal(componentSource.includes('-webkit-line-clamp: 2'), true, '职位标题必须最多显示两行')
assert.equal(componentSource.includes('max-height: 2.5rem'), true, '职位标题必须锁定两行最大高度')
assert.match(
  componentCompact,
  /\.position-industry,[\s\S]*white-space: nowrap;[\s\S]*text-overflow: ellipsis;/,
  '行业必须保持单行省略',
)
assert.match(
  componentCompact,
  /\.position-metadata \{ box-sizing: border-box; flex: 0 0 7rem; width: 7rem; min-width: 7rem;/,
  '薪资、城市和到岗列必须固定为 7rem 且禁止被标题挤压',
)
assert.equal(
  componentSource.includes('justify-between'),
  false,
  '右侧字段不得独立均分高度，否则会与左侧字段错行',
)
assert.match(
  componentCompact,
  /\.position-salary \{ min-height: 1.25rem; padding-right: 2rem;/,
  '薪资行必须保留空值高度，并为右上选中角标预留空间',
)

const titleRowStart = componentSource.indexOf('class="position-paired-row position-title-row"')
const detailsRowStart = componentSource.indexOf('class="position-paired-row position-details-row"')
const availabilityRowStart = componentSource.indexOf(
  'class="position-paired-row position-availability-row"',
)

assert.equal(
  titleRowStart < detailsRowStart && detailsRowStart < availabilityRowStart,
  true,
  '共享职位卡片必须按标题行、详情行、可选到岗行顺序渲染',
)

const titleRowSource = componentSource.slice(titleRowStart, detailsRowStart)
assert.equal(
  titleRowSource.includes('class="position-title font-medium"') &&
    titleRowSource.includes('position-metadata position-salary'),
  true,
  '第一行必须成对渲染职位标题和薪资',
)
assert.equal(
  titleRowSource.includes('position-industry') || titleRowSource.includes('position-city'),
  false,
  '第一行不得混入行业或城市',
)

const detailsRowSource = componentSource.slice(detailsRowStart, availabilityRowStart)
assert.equal(
  detailsRowSource.includes('class="position-industry text-gray-600"') &&
    detailsRowSource.includes('position-metadata position-meta-row') &&
    detailsRowSource.includes('class="position-city text-gray-400 text-xs"'),
  true,
  '第二行必须成对渲染行业和城市',
)

const availabilityTagStart = componentSource.lastIndexOf('<view', availabilityRowStart)
const availabilityRowSource = componentSource.slice(availabilityTagStart)
assert.equal(
  availabilityRowSource.includes('v-if="availabilityLabel"') &&
    availabilityRowSource.includes('position-metadata position-availability'),
  true,
  '第三行必须仅在有到岗时间时渲染右侧字段',
)

const pages = [
  {
    label: 'record-simulate',
    path: 'src/pages/interviews/record-simulate.vue',
    expectsAvailability: true,
  },
  {
    label: 'process-simulation',
    path: 'src/pages/interviews/process-simulation.vue',
    expectsAvailability: false,
  },
]

for (const page of pages) {
  const source = readSource(page.path)
  assert.match(
    source,
    /import MockInterviewPositionCard from '@\/components\/interviews\/MockInterviewPositionCard\.vue'/,
    `${page.label} 必须显式导入共享职位卡片`,
  )
  assert.equal(
    (source.match(/<MockInterviewPositionCard/g) || []).length,
    1,
    `${page.label} 必须只维护一个共享职位卡片入口`,
  )

  for (const binding of ['title', 'industry', 'salary', 'city', 'selected']) {
    assert.equal(
      source.includes(`:${binding}=`),
      true,
      `${page.label} 必须向共享职位卡片传入 ${binding}`,
    )
  }

  assert.equal(
    source.includes('@select="selectItem(index)"'),
    true,
    `${page.label} 必须通过共享 select 事件保持原有单选行为`,
  )
  assert.equal(
    source.includes(':availability-label='),
    page.expectsAvailability,
    `${page.label} 的到岗文案传递必须符合页面产品合同`,
  )
  assert.equal(
    source.includes('absolute right-2.5'),
    false,
    `${page.label} 不得保留脱离布局流的右侧职位元数据列`,
  )
}

console.log('mockInterviewPositionCard.spec.ts passed')

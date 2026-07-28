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
  /\.position-metadata \{ flex: 0 0 7rem; width: 7rem; min-width: 7rem;/,
  '薪资、城市和到岗列必须固定为 7rem 且禁止被标题挤压',
)
assert.equal(
  componentSource.includes('flex-col justify-between text-sm pt-2 pb-2'),
  true,
  '右侧元数据必须在卡片高度内上下对齐，不受标题行数变化影响',
)
assert.match(
  componentCompact,
  /\.position-salary \{ min-height: 1.25rem; padding-right: 1.5rem;/,
  '薪资行必须保留空值高度，并为右上选中角标预留空间',
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

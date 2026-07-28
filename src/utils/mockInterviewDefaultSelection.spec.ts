import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const source = readFileSync(join(process.cwd(), 'src/pages/interviews/record-simulate.vue'), 'utf8')
const compactSource = source.replace(/\s+/g, ' ')

assert.equal(
  compactSource.includes('items.value = response.data.map((element, index) => {'),
  true,
  '职位成功响应必须通过一次 map 生成列表',
)
assert.equal(
  compactSource.includes('selected: index === 0,'),
  true,
  '职位列表首项必须默认选中，其他项保持未选中',
)
assert.equal(
  compactSource.includes(
    '!positionLoading.value && items.value.length > 0 && items.value.some((item) => item.selected) && !isSubmittingInterview.value',
  ),
  true,
  '确定按钮必须同时受职位加载、空列表、选中项和提交状态约束',
)
assert.match(
  source,
  /:class="\s*canGenerateInterview\s*\?/,
  '确定按钮必须用 canGenerateInterview 提供视觉禁用态',
)
assert.equal(
  source.includes(':aria-disabled="!canGenerateInterview"'),
  true,
  '确定按钮必须暴露禁用语义',
)

const generateStart = source.indexOf('const generateInterview = () => {')
const generateEnd = source.indexOf('\nonMounted(', generateStart)
assert.notEqual(generateStart, -1, '必须定义 generateInterview')
assert.notEqual(generateEnd, -1, '必须能定位 generateInterview 函数边界')
const generateSource = source.slice(generateStart, generateEnd)

assert.equal(
  generateSource.includes('if (!canGenerateInterview.value) return'),
  true,
  '无效状态点击确定时必须直接返回',
)
assert.equal(
  generateSource.includes('const selectedItemSnapshot = { ...selectedItem }'),
  true,
  '发起请求前必须快照当前选中职位',
)
assert.equal(generateSource.includes('showSheet.value = false'), false, '无效点击不得关闭职位弹层')
assert.equal(
  generateSource.indexOf('isSubmittingInterview.value = true') <
    generateSource.indexOf('submitTestInterview(selectedItemSnapshot)'),
  true,
  '发起请求前必须先加提交锁，阻止重复 POST',
)

const submitStart = source.indexOf('const submitTestInterview = (selectedItem: any) => {')
const submitEnd = source.indexOf('\nconst goProcess', submitStart)
assert.notEqual(submitStart, -1, '必须定义 submitTestInterview')
assert.notEqual(submitEnd, -1, '必须能定位 submitTestInterview 函数边界')
const submitSource = source.slice(submitStart, submitEnd)

assert.equal(
  (submitSource.match(/method:\s*'POST'/g) || []).length,
  1,
  '单次生成动作只能声明一个 POST 请求',
)
assert.match(
  submitSource,
  /complete:\s*\(\)\s*=>\s*\{[\s\S]*?isSubmittingInterview\.value = false/,
  '请求 complete 后必须恢复提交状态',
)

console.log('mockInterviewDefaultSelection.spec.ts passed')

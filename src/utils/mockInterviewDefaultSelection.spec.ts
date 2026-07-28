import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

interface ContractPage {
  label: string
  path: string
  generateEndMarker: string
  submitEndMarker: string
  requiresAuthorizationHeader: boolean
}

const pages: ContractPage[] = [
  {
    label: 'record-simulate',
    path: 'src/pages/interviews/record-simulate.vue',
    generateEndMarker: '\nonMounted(',
    submitEndMarker: '\nconst goProcess',
    requiresAuthorizationHeader: false,
  },
  {
    label: 'process-simulation',
    path: 'src/pages/interviews/process-simulation.vue',
    generateEndMarker: '\nconst submitTestInterview',
    submitEndMarker: '\nonMounted(',
    requiresAuthorizationHeader: true,
  },
]

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

for (const page of pages) {
  const source = readSource(page.path)
  const compactSource = source.replace(/\s+/g, ' ')
  const message = (contract: string) => `${page.label}: ${contract}`

  assert.equal(
    compactSource.includes('items.value = response.data.map((element, index) => {'),
    true,
    message('职位成功响应必须通过一次 map 生成列表'),
  )
  assert.equal(
    compactSource.includes('selected: index === 0,'),
    true,
    message('职位列表首项必须默认选中，其他项保持未选中'),
  )
  assert.equal(
    compactSource.includes(
      '!positionLoading.value && items.value.length > 0 && items.value.some((item) => item.selected) && !isSubmittingInterview.value',
    ),
    true,
    message('确定按钮必须同时受职位加载、空列表、选中项和提交状态约束'),
  )
  assert.equal(
    compactSource.includes('positionLoading.value = true items.value = []'),
    true,
    message('职位请求开始时必须进入独立加载态并清空旧列表'),
  )
  assert.equal(
    source.includes('if (!Array.isArray(response.data))'),
    true,
    message('职位成功响应必须校验数组格式'),
  )
  assert.match(
    source,
    /finally\s*\{[\s\S]*?positionLoading\.value = false/,
    message('职位请求结束时必须恢复独立加载态'),
  )
  assert.match(
    source,
    /:class="\s*canGenerateInterview\s*\?/,
    message('确定按钮必须用 canGenerateInterview 提供视觉禁用态'),
  )
  assert.equal(
    source.includes(':aria-disabled="!canGenerateInterview"'),
    true,
    message('确定按钮必须暴露禁用语义'),
  )
  assert.equal(
    source.includes("{{ isSubmittingInterview ? '生成中...' : '确定' }}"),
    true,
    message('提交期间必须显示生成中状态'),
  )

  const generateStart = source.indexOf('const generateInterview = () => {')
  const generateEnd = source.indexOf(page.generateEndMarker, generateStart)
  assert.notEqual(generateStart, -1, message('必须定义同步 generateInterview'))
  assert.notEqual(generateEnd, -1, message('必须能定位 generateInterview 函数边界'))
  const generateSource = source.slice(generateStart, generateEnd)

  assert.equal(
    generateSource.includes('if (!canGenerateInterview.value) return'),
    true,
    message('无效状态点击确定时必须直接返回'),
  )
  assert.equal(
    generateSource.includes('const selectedItemSnapshot = { ...selectedItem }'),
    true,
    message('发起请求前必须快照当前选中职位'),
  )
  assert.equal(
    generateSource.includes('showSheet.value = false'),
    false,
    message('无效点击不得关闭职位弹层'),
  )
  assert.equal(
    generateSource.indexOf('isSubmittingInterview.value = true') <
      generateSource.indexOf('submitTestInterview(selectedItemSnapshot)'),
    true,
    message('发起请求前必须先加提交锁，阻止重复 POST'),
  )

  const submitStart = source.indexOf('const submitTestInterview = (selectedItem: any) => {')
  const submitEnd = source.indexOf(page.submitEndMarker, submitStart)
  assert.notEqual(submitStart, -1, message('必须定义 submitTestInterview(selectedItem)'))
  assert.notEqual(submitEnd, -1, message('必须能定位 submitTestInterview 函数边界'))
  const submitSource = source.slice(submitStart, submitEnd)

  assert.equal(
    (submitSource.match(/method:\s*'POST'/g) || []).length,
    1,
    message('单次生成动作只能声明一个 POST 请求'),
  )
  assert.match(
    submitSource,
    /res\.statusCode === 200 && [^\n]*redirect_url/,
    message('只有实际 HTTP 200 且包含 redirect_url 才能跳转'),
  )
  assert.match(
    submitSource,
    /complete:\s*\(\)\s*=>\s*\{[\s\S]*?isSubmittingInterview\.value = false[\s\S]*?toast\.close\(\)/,
    message('请求 complete 后必须恢复提交状态并关闭 loading toast'),
  )
  assert.match(
    submitSource,
    /catch\s*\(error\)\s*\{[\s\S]*?isSubmittingInterview\.value = false[\s\S]*?toast\.close\(\)/,
    message('同步异常时必须恢复提交状态并关闭 loading toast'),
  )
  assert.equal(
    submitSource.includes('showSheet.value = false'),
    false,
    message('请求失败时职位弹层必须保持打开'),
  )

  if (page.requiresAuthorizationHeader) {
    assert.match(
      submitSource,
      /header:\s*\{\s*Authorization:\s*`Bearer \$\{uni\.getStorageSync\('token'\)\}`\s*\}/,
      message('创建模拟面试请求必须保留 Authorization 请求头'),
    )
  }
}

console.log('mockInterviewDefaultSelection.spec.ts passed')

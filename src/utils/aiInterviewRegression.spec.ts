import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { resolveH5SafeAreaTopForTest } from './useNavBar'

const root = process.cwd()

const readSource = (relativePath: string) => readFileSync(join(root, relativePath), 'utf8')

const run = () => {
  assert.deepEqual(
    resolveH5SafeAreaTopForTest({
      systemInfo: {
        platform: 'android',
        osName: 'Android',
        system: 'Android 13',
      },
      rawSafeAreaTop: 0,
      statusBarHeight: 24,
      cssSafeAreaTop: 0,
      cssStatusBarHeight: 0,
      pixelRatio: 2.75,
    }),
    {
      top: 24,
      source: 'android-status-bar-height',
    },
  )

  assert.deepEqual(
    resolveH5SafeAreaTopForTest({
      systemInfo: {
        platform: 'android',
        osName: 'HarmonyOS',
        system: 'HarmonyOS',
      },
      rawSafeAreaTop: 120,
      statusBarHeight: 24,
      cssSafeAreaTop: 0,
      cssStatusBarHeight: 0,
      pixelRatio: 3,
    }),
    {
      top: 24,
      source: 'android-status-bar-height',
    },
    'Android/Harmony H5 must treat safeArea.top as a screen coordinate, not a top inset',
  )

  assert.deepEqual(
    resolveH5SafeAreaTopForTest({
      systemInfo: {
        platform: 'android',
        osName: 'Android',
        system: 'Android 13',
      },
      rawSafeAreaTop: 0,
      statusBarHeight: 66,
      cssSafeAreaTop: 0,
      cssStatusBarHeight: 0,
      pixelRatio: 2.75,
    }),
    {
      top: 24,
      source: 'android-status-bar-height-normalized',
    },
    'Android/Harmony H5 must normalize physical statusBarHeight to CSS px',
  )

  assert.deepEqual(
    resolveH5SafeAreaTopForTest({
      systemInfo: {
        platform: 'android',
        osName: 'HarmonyOS',
        system: 'HarmonyOS',
      },
      rawSafeAreaTop: 66,
      statusBarHeight: 0,
      cssSafeAreaTop: 0,
      cssStatusBarHeight: 24,
      pixelRatio: 2.75,
    }),
    {
      top: 24,
      source: 'android-css-status-bar-height',
    },
    'uni-app --status-bar-height must be preferred over ambiguous system coordinates',
  )

  assert.deepEqual(
    resolveH5SafeAreaTopForTest({
      systemInfo: {
        platform: 'android',
        osName: 'Android',
        system: 'Android 13',
      },
      rawSafeAreaTop: 84,
      statusBarHeight: 84,
      cssSafeAreaTop: 0,
      cssStatusBarHeight: 84,
      pixelRatio: 3,
      devicePxPerCssPx: 3,
    }),
    {
      top: 28,
      source: 'android-css-status-bar-height-normalized',
    },
    'Android/Harmony H5 must normalize physical --status-bar-height values before laying out AI headers',
  )

  assert.deepEqual(
    resolveH5SafeAreaTopForTest({
      systemInfo: {
        platform: 'android',
        osName: 'Android',
        system: 'Android 13',
      },
      rawSafeAreaTop: 84,
      statusBarHeight: 84,
      cssSafeAreaTop: 0,
      cssStatusBarHeight: 28,
      pixelRatio: 3,
      devicePxPerCssPx: 3,
    }),
    {
      top: 28,
      source: 'android-css-status-bar-height',
    },
    'Android/Harmony H5 must not divide CSS-pixel --status-bar-height values a second time',
  )

  const processSource = readSource('src/pages/interviews/process.vue')
  assert.equal(
    processSource.includes('/requirManner'),
    false,
    'process.vue must not generate the nonexistent /requirManner H5 route',
  )
  assert.equal(
    /startPager\s*\(\s*requireMannerUrl/.test(processSource),
    false,
    'create AI interview must not use startPager(requireMannerUrl)',
  )

  const aiPages = [
    'src/pages/interviews/process.vue',
    'src/pages/interviews/process-simulation.vue',
    'src/pages/interviews/record.vue',
    'src/pages/interviews/record-simulate.vue',
  ]

  for (const page of aiPages) {
    const source = readSource(page)
    assert.equal(source.includes('<AiPageNavBar'), true, `${page} must use shared AI nav`)
    assert.match(
      source,
      /import\s+AiPageNavBar\s+from\s+['"]@\/components\/public\/AiPageNavBar\.vue['"]/,
      `${page} must explicitly import AiPageNavBar so H5 builds render the back button/title`,
    )
    assert.match(
      source,
      /import\s+AiRuntimeDiagPanel\s+from\s+['"]@\/components\/public\/AiRuntimeDiagPanel\.vue['"]/,
      `${page} must explicitly import AiRuntimeDiagPanel so runtime diagnostics render on devices`,
    )
    assert.equal(
      source.includes('marginTop: safeAreaTop'),
      false,
      `${page} must not hand-roll nav safeAreaTop margins`,
    )
    assert.equal(
      source.includes('height: topBarHeight'),
      false,
      `${page} must not hand-roll fixed nav height`,
    )
  }

  const recordSimulateSource = readSource('src/pages/interviews/record-simulate.vue')
  assert.match(
    recordSimulateSource,
    /paddingTop:\s*`\$\{topBarHeight\}px`/,
    'record-simulate.vue must reserve the normalized safe-area plus nav height before its banner',
  )
  assert.equal(
    recordSimulateSource.includes('show-background'),
    true,
    'record-simulate.vue must render a solid nav background so the back button/title stay visible',
  )

  const aiNavSource = readSource('src/components/public/AiPageNavBar.vue')
  assert.equal(
    aiNavSource.includes('zIndex: 1000'),
    true,
    'shared AI nav must stay above media banners and card layers',
  )
  assert.equal(
    aiNavSource.includes('drop-shadow'),
    true,
    'shared AI nav back icon must stay visible on busy AI banner images',
  )
  assert.equal(
    aiNavSource.includes('textShadow'),
    true,
    'shared AI nav title must stay visible on busy AI banner images',
  )

  const cameraSource = readSource('src/pages/camera/index.vue')
  assert.equal(
    cameraSource.includes("uni.getStorageSync('token')"),
    false,
    'camera requests must use synchronized H5 session token, not direct storage token reads',
  )
}

run()
console.log('aiInterviewRegression.spec.ts passed')

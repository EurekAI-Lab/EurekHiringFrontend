<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '环境测试页面',
  },
}
</route>

<template>
  <view class="page">
    <view class="top-bar">
      <view class="title">H5 联调测试</view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="card">
        <view class="section-title">当前状态</view>
        <view class="row">运行平台：{{ currentEnvironment }}</view>
        <view class="row">桥接模拟：{{ bridgeSimulator }}</view>
        <view class="row">日志条数：{{ bridgeLogs.length }}</view>
        <view class="row">构建版本：{{ currentBuildId || '(empty)' }}</view>
        <view class="row">API 基址：{{ automationBaseUrl }}</view>
      </view>

      <view class="card">
        <view class="section-title">桥接模拟</view>
        <view class="button-row">
          <button class="action-button" @click="switchBridge('android')">模拟 Android</button>
          <button class="action-button" @click="switchBridge('ios')">模拟 iOS</button>
          <button class="action-button secondary" @click="switchBridge('none')">清空模拟</button>
        </view>
      </view>

      <view class="card">
        <view class="section-title">原生协议</view>
        <view class="button-row">
          <button class="action-button" @click="handleNavigateBack">pagerFinish</button>
          <button class="action-button" @click="handleOpenAiJobList">openAiJobList</button>
          <button class="action-button" @click="handleAiInterviewSaved">aiInterviewSaved</button>
          <button class="action-button" @click="handleInterviewOver">Interview_over</button>
        </view>
      </view>

      <view class="card">
        <view class="section-title">页面跳转</view>
        <input v-model="interviewIdInput" class="field" type="number" placeholder="interviewId" />
        <input v-model="tokenInput" class="field" type="text" placeholder="token（可选）" />
        <view class="button-row">
          <button class="action-button" @click="openSimulateRecord">模拟面试列表</button>
          <button class="action-button" @click="openCameraPage">相机页（uni）</button>
          <button class="action-button" @click="openCameraPageByLocation">相机页（H5）</button>
          <button class="action-button" @click="openLoadingPage">报告 loading</button>
          <button class="action-button" @click="openReportPage">报告页</button>
        </view>
      </view>

      <view class="card">
        <view class="section-title">模拟面试自动验证</view>
        <input
          v-model="jobseekerPositionIdInput"
          class="field"
          type="number"
          placeholder="jobseekerPositionId"
        />
        <input
          v-model="expectedPositionNameInput"
          class="field"
          type="text"
          placeholder="期望岗位名（如：行业不限·算法工程师）"
        />
        <view class="button-row">
          <button class="action-button" @click="runMockInterviewSelfTest">创建并校验相机页</button>
          <button class="action-button secondary" @click="loadAutomationResult">读取最近结果</button>
        </view>
        <view class="automation-panel">
          <view class="automation-line">AUTOMATION_STATUS: {{ automationStatus }}</view>
          <view class="automation-line">AUTOMATION_CASE_ID: {{ automationCaseId || '(empty)' }}</view>
          <view class="automation-line automation-json">
            AUTOMATION_RESULT_B64: {{ automationResultBase64 || '(empty)' }}
          </view>
        </view>
      </view>

      <view class="card">
        <view class="section-title">桥接日志</view>
        <view class="button-row">
          <button class="action-button secondary" @click="refreshLogs">刷新日志</button>
          <button class="action-button secondary" @click="clearLogs">清空日志</button>
        </view>
        <view v-if="bridgeLogs.length === 0" class="empty-log">暂无日志</view>
        <view v-else class="log-list">
          <view v-for="(item, index) in bridgeLogs" :key="`${item.timestamp}-${index}`" class="log-item">
            <view class="log-time">{{ item.timestamp }}</view>
            <view class="log-method">{{ item.bridge }} / {{ item.method }}</view>
            <view class="log-params">{{ formatLogParams(item.params) }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  aiInterviewSaved,
  getPlatformType,
  interviewOver,
  navigateBack,
  openAiJobList,
} from '@/utils/platformUtils'
import {
  clearBridgeDebugLogs,
  getBridgeDebugLogs,
  getBridgeSimulator,
  setBridgeSimulator,
} from '@/utils/nativeBridgeDebug'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import {
  buildAbsoluteH5ReloadUrl,
  getCurrentBuildId,
  getRelativeUniPathFromUrl,
  getCurrentRouteKey,
  isH5TestSite,
  resolveApiBaseUrlForCurrentSite,
} from '@/utils/url'
import { updateRuntimeDiagnostics } from '@/utils/runtimeDiagnostics'

const currentEnvironment = ref('')
const bridgeSimulator = ref<'none' | 'android' | 'ios'>('none')
const bridgeLogs = ref<any[]>([])
const interviewIdInput = ref('')
const tokenInput = ref('')
const jobseekerPositionIdInput = ref('')
const expectedPositionNameInput = ref('')
const automationStatus = ref<'IDLE' | 'RUNNING' | 'PASS' | 'FAIL'>('IDLE')
const automationCaseId = ref('')
const automationResultBase64 = ref('')
const automationBaseUrl = ref(import.meta.env.VITE_SERVER_BASEURL)
const isAutomationRunning = ref(false)
const currentBuildId = ref('')

interface MockInterviewAutomationResult {
  status: 'RUNNING' | 'PASS' | 'FAIL'
  caseId: string
  expectedInterviewId: number | null
  actualInterviewId: number | null
  expectedPositionName: string
  actualPositionName: string
  enterpriseName: string
  questionCount: number
  firstQuestionId: number | null
  href: string
  createdInterviewId?: number | null
  createdPositionName?: string
  createRedirectUrl?: string
  resolvedApiBase?: string
  buildId?: string
  error?: string
  reportedAt: string
}

const getAutomationStorageKey = (caseId: string) => `__mock_interview_self_test__:${caseId}`

const getAutomationRouteParams = () => {
  const params = new URLSearchParams()

  // #ifdef H5
  try {
    const relative = getRelativeUniPathFromUrl(window.location.href)
    if (relative && relative.includes('?')) {
      const [, search = ''] = relative.split('?')
      const h5Params = new URLSearchParams(search)
      h5Params.forEach((value, key) => {
        params.set(key, value)
      })
    }
  } catch (error) {
    console.error('解析测试页H5参数失败:', error)
  }
  // #endif

  return params
}

const toBase64 = (value: string) => encodeURIComponent(value)

const updateAutomationMarkers = (result?: MockInterviewAutomationResult | null) => {
  if (!result) {
    automationResultBase64.value = ''
    return
  }
  automationStatus.value = result.status
  automationCaseId.value = result.caseId
  automationResultBase64.value = toBase64(JSON.stringify(result))
}

const syncAutomationBaseUrl = () => {
  let nextBaseUrl = import.meta.env.VITE_SERVER_BASEURL
  currentBuildId.value = getCurrentBuildId()
  // #ifdef H5
  if (typeof window !== 'undefined') {
    nextBaseUrl = resolveApiBaseUrlForCurrentSite(nextBaseUrl)
    updateRuntimeDiagnostics({
      buildId: getCurrentBuildId(),
      origin: window.location.origin,
      currentRoute: getCurrentRouteKey(),
      resolvedApiBase: nextBaseUrl,
      siteKind: isH5TestSite() ? 'test' : 'production',
      pageName: 'test-page',
    })
  }
  // #endif
  if (import.meta.env.MODE === 'test' && !nextBaseUrl.includes('/test/')) {
    nextBaseUrl = nextBaseUrl.replace('/api', '/test/api')
  }
  automationBaseUrl.value = nextBaseUrl
}

const syncInputsFromRoute = (options?: Record<string, any>) => {
  syncAutomationBaseUrl()
  const params = getAutomationRouteParams()

  const readValue = (key: string) => {
    const optionValue = options?.[key]
    if (optionValue !== undefined && optionValue !== null && String(optionValue) !== '') {
      return String(optionValue)
    }
    return params.get(key) || ''
  }

  interviewIdInput.value = readValue('interviewId') || interviewIdInput.value
  tokenInput.value = readValue('token') || tokenInput.value
  jobseekerPositionIdInput.value = readValue('jobseekerPositionId') || jobseekerPositionIdInput.value
  expectedPositionNameInput.value =
    readValue('expectedPositionName') || expectedPositionNameInput.value

  const nextCaseId = readValue('automationCaseId')
  if (nextCaseId) {
    automationCaseId.value = nextCaseId
  }
}

const loadAutomationResult = () => {
  if (!automationCaseId.value) {
    updateAutomationMarkers(null)
    return null
  }

  const result = uni.getStorageSync(getAutomationStorageKey(automationCaseId.value)) as
    | MockInterviewAutomationResult
    | undefined
  if (!result) {
    automationStatus.value = 'IDLE'
    automationResultBase64.value = ''
    return null
  }

  updateAutomationMarkers(result)
  return result
}

const runMockInterviewSelfTest = async () => {
  if (isAutomationRunning.value) {
    return
  }

  if (!tokenInput.value.trim()) {
    automationStatus.value = 'FAIL'
    automationResultBase64.value = toBase64(
      JSON.stringify({
        status: 'FAIL',
        reason: 'missing_token',
      }),
    )
    return
  }

  if (!jobseekerPositionIdInput.value.trim()) {
    automationStatus.value = 'FAIL'
    automationResultBase64.value = toBase64(
      JSON.stringify({
        status: 'FAIL',
        reason: 'missing_jobseeker_position_id',
      }),
    )
    return
  }

  isAutomationRunning.value = true
  automationStatus.value = 'RUNNING'
  automationCaseId.value = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  automationResultBase64.value = ''

  try {
    uni.setStorageSync('token', tokenInput.value.trim())

    const createResponse = await uni.request({
      url: `${automationBaseUrl.value}${API_ENDPOINTS.interviews.createMock(Number(jobseekerPositionIdInput.value))}`,
      method: 'POST',
      header: { Authorization: `Bearer ${tokenInput.value.trim()}` },
    })

    const createData = createResponse.data as any
    const redirectUrl = createData?.data?.redirect_url || ''
    const relativeUrl = getRelativeUniPathFromUrl(redirectUrl)
    const createdInterviewId = Number(createData?.data?.interview_id || 0) || null
    const createdPositionName = String(createData?.data?.position_name || '')

    if (createResponse.statusCode !== 200 || !relativeUrl || !createdInterviewId) {
      throw new Error(`create_mock_interview 响应异常: ${JSON.stringify(createData)}`)
    }

    const returnRelativeUrl = `/pages/test/index?automation=mockInterview&automationCaseId=${encodeURIComponent(automationCaseId.value)}`
    const separator = relativeUrl.includes('?') ? '&' : '?'
    const targetUrl =
      `${relativeUrl}${separator}test=true` +
      `&token=${encodeURIComponent(tokenInput.value.trim())}` +
      `&selfTestCaseId=${encodeURIComponent(automationCaseId.value)}` +
      `&selfTestAutoReturn=1` +
      `&selfTestReturn=${encodeURIComponent(returnRelativeUrl)}` +
      `&selfTestExpectedInterviewId=${encodeURIComponent(String(createdInterviewId))}` +
      `&selfTestExpectedPositionName=${encodeURIComponent(expectedPositionNameInput.value.trim() || createdPositionName)}`

    uni.setStorageSync(getAutomationStorageKey(automationCaseId.value), {
      status: 'RUNNING',
      caseId: automationCaseId.value,
      expectedInterviewId: createdInterviewId,
      actualInterviewId: null,
      expectedPositionName: expectedPositionNameInput.value.trim() || createdPositionName,
      actualPositionName: '',
      enterpriseName: '',
      questionCount: 0,
      firstQuestionId: null,
      href: '',
      createdInterviewId,
      createdPositionName,
      createRedirectUrl: redirectUrl,
      reportedAt: new Date().toISOString(),
    } as MockInterviewAutomationResult)

    console.log('[test] mock interview automation create success:', {
      automationCaseId: automationCaseId.value,
      createdInterviewId,
      createdPositionName,
      targetUrl,
      redirectUrl,
    })

    if (typeof window !== 'undefined') {
      window.location.replace(buildAbsoluteH5ReloadUrl(targetUrl))
      return
    }

    uni.reLaunch({ url: targetUrl })
  } catch (error) {
    const failure = {
      status: 'FAIL',
      caseId: automationCaseId.value,
      expectedInterviewId: null,
      actualInterviewId: null,
      expectedPositionName: expectedPositionNameInput.value.trim(),
      actualPositionName: '',
      enterpriseName: '',
      questionCount: 0,
      firstQuestionId: null,
      href: '',
      reportedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    }
    console.error('[test] mock interview automation failed:', failure)
    automationStatus.value = 'FAIL'
    automationResultBase64.value = toBase64(JSON.stringify(failure))
  } finally {
    isAutomationRunning.value = false
  }
}

const refreshRuntime = () => {
  currentEnvironment.value = getPlatformType()
  bridgeSimulator.value = getBridgeSimulator()
  bridgeLogs.value = getBridgeDebugLogs().slice().reverse()
}

const switchBridge = (type: 'none' | 'android' | 'ios') => {
  setBridgeSimulator(type)
  refreshRuntime()
}

const refreshLogs = () => {
  bridgeLogs.value = getBridgeDebugLogs().slice().reverse()
}

const clearLogs = () => {
  clearBridgeDebugLogs()
  refreshLogs()
}

const handleNavigateBack = () => {
  navigateBack()
  refreshLogs()
}

const handleOpenAiJobList = () => {
  openAiJobList()
  refreshLogs()
}

const handleAiInterviewSaved = () => {
  aiInterviewSaved()
  refreshLogs()
}

const handleInterviewOver = () => {
  interviewOver('https://example.com/#/pages/about/mspj?interviewId=1317', '调试企业', '算法工程师')
  refreshLogs()
}

const buildQuery = (includeType = true) => {
  const parts: string[] = []
  if (interviewIdInput.value) {
    parts.push(`interviewId=${encodeURIComponent(interviewIdInput.value)}`)
  }
  if (includeType) {
    parts.push('type=2')
  }
  parts.push('entry=simulate-record')
  if (tokenInput.value) {
    parts.push(`token=${encodeURIComponent(tokenInput.value)}`)
  }
  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

const buildCameraQuery = () => {
  const parts: string[] = []
  if (interviewIdInput.value) {
    parts.push(`interviewId=${encodeURIComponent(interviewIdInput.value)}`)
  }
  parts.push('test=true')
  if (tokenInput.value) {
    parts.push(`token=${encodeURIComponent(tokenInput.value)}`)
  }
  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

const openSimulateRecord = () => {
  uni.navigateTo({ url: '/pages/interviews/record-simulate' })
}

const openCameraPage = () => {
  uni.reLaunch({ url: `/pages/camera/index${buildCameraQuery()}` })
}

const openCameraPageByLocation = () => {
  const relativeUrl = `/pages/camera/index${buildCameraQuery()}`
  if (typeof window !== 'undefined') {
    window.location.replace(buildAbsoluteH5ReloadUrl(relativeUrl))
    return
  }
  uni.reLaunch({ url: relativeUrl })
}

const openLoadingPage = () => {
  uni.navigateTo({ url: `/pages/about/mspj-loading${buildQuery()}` })
}

const openReportPage = () => {
  uni.navigateTo({ url: `/pages/about/mspj${buildQuery()}` })
}

const formatLogParams = (params: any) => {
  if (params === null || params === undefined || params === '') {
    return '(empty)'
  }
  return typeof params === 'string' ? params : JSON.stringify(params)
}

onMounted(() => {
  syncInputsFromRoute()
  refreshRuntime()
  loadAutomationResult()
})

onShow(() => {
  syncInputsFromRoute()
  refreshRuntime()
  const params = getAutomationRouteParams()
  const stage = params.get('selfTestStage')
  if (stage === 'result') {
    loadAutomationResult()
    return
  }
  if (params.get('automation') === 'mockInterview' && params.get('autoRun') === '1') {
    void runMockInterviewSelfTest()
  }
})

onLoad((options) => {
  syncInputsFromRoute(options as Record<string, any>)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #1f2937;
}

.top-bar {
  padding: 44px 20px 12px;
  background: linear-gradient(135deg, #0f62fe 0%, #38bdf8 100%);
}

.title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.content {
  height: calc(100vh - 88px);
  padding: 16px;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: 0 6px 18px rgba(15, 98, 254, 0.08);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.row {
  font-size: 13px;
  line-height: 20px;
  margin-bottom: 4px;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-button {
  flex: 1 1 42%;
  min-width: 130px;
  background: #1677ff;
  color: #fff;
  border-radius: 999px;
  font-size: 13px;
}

.secondary {
  background: #eef4ff;
  color: #2857c5;
}

.field {
  width: 100%;
  height: 40px;
  background: #f7f9fc;
  border-radius: 10px;
  padding: 0 12px;
  margin-bottom: 10px;
  box-sizing: border-box;
  font-size: 13px;
}

.automation-panel {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f7f9fc;
}

.automation-line {
  font-size: 12px;
  line-height: 18px;
  color: #334155;
  word-break: break-all;
}

.automation-json {
  margin-top: 6px;
}

.empty-log {
  color: #6b7280;
  font-size: 13px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: #f7f9fc;
}

.log-time {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
}

.log-method {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.log-params {
  font-size: 12px;
  color: #374151;
  word-break: break-all;
}
</style>

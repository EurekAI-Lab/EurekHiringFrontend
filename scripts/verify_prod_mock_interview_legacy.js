#!/usr/bin/env node

const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const parseArgs = (argv) => {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]
    if (!current.startsWith('--')) continue
    const key = current.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) {
      args[key] = 'true'
      continue
    }
    args[key] = next
    index += 1
  }
  return args
}

const required = (args, key) => {
  const value = args[key]
  if (!value) {
    throw new Error(`缺少参数 --${key}`)
  }
  return value
}

const getJson = async (url, init = {}) => {
  const response = await fetch(url, init)
  const text = await response.text()

  let payload = null
  try {
    payload = text ? JSON.parse(text) : null
  } catch (error) {
    throw new Error(`接口返回非 JSON: url=${url}, status=${response.status}, body=${text.slice(0, 300)}`)
  }

  if (!response.ok) {
    throw new Error(`接口请求失败: url=${url}, status=${response.status}, body=${JSON.stringify(payload)}`)
  }

  return payload
}

const login = async (apiUrl, phone, password) => {
  const payload = await getJson(`${trimTrailingSlash(apiUrl)}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, password }),
  })

  if (!payload?.access_token) {
    throw new Error(`登录失败: ${JSON.stringify(payload)}`)
  }

  return payload.access_token
}

const fetchBuildId = async (frontUrl) => {
  const response = await fetch(`${trimTrailingSlash(frontUrl)}/?__build_check__=${Date.now()}`, {
    cache: 'no-store',
  })
  const html = await response.text()
  const matched = html.match(/<html[^>]*build-time="([^"]+)"/i)
  return matched?.[1] || ''
}

const getPositionTitle = (payload) => payload?.data?.position?.title || ''
const getEnterpriseName = (payload) => payload?.data?.position?.enterprise_name || ''
const getQuestionCount = (payload) => Array.isArray(payload?.data?.questions) ? payload.data.questions.length : 0

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const frontUrl = trimTrailingSlash(required(args, 'front-url'))
  const apiUrl = trimTrailingSlash(required(args, 'api-url'))
  const jobseekerPositionId = required(args, 'jobseeker-position-id')
  const expectedPositionName = args['expected-position-name'] || ''

  let token = args.token || ''
  if (!token) {
    token = await login(apiUrl, required(args, 'phone'), required(args, 'password'))
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const buildId = await fetchBuildId(frontUrl)
  const createPayload = await getJson(
    `${apiUrl}/interviews/create_mock_interview/${jobseekerPositionId}`,
    { method: 'POST', headers },
  )

  const interviewId = Number(createPayload?.data?.interview_id || 0)
  const createdPositionName = String(createPayload?.data?.position_name || '')
  if (!interviewId) {
    throw new Error(`创建模拟面试失败: ${JSON.stringify(createPayload)}`)
  }

  const expectedTitle = expectedPositionName || createdPositionName
  const legacyProdPayload = await getJson(
    `${frontUrl}/test/api/interviews/interview_details/${interviewId}`,
    {
      headers: {
        ...headers,
        Referer: `${frontUrl}/`,
      },
    },
  )
  const prodPayload = await getJson(
    `${apiUrl}/interviews/interview_details/${interviewId}`,
    { headers },
  )
  const legacyTestPayload = await getJson(
    `${frontUrl}/test/api/interviews/interview_details/${interviewId}`,
    {
      headers: {
        ...headers,
        Referer: `${frontUrl}/test`,
      },
    },
  )

  const result = {
    status: 'PASS',
    buildId,
    interviewId,
    createdPositionName,
    expectedPositionName: expectedTitle,
    prodTitle: getPositionTitle(prodPayload),
    legacyProdTitle: getPositionTitle(legacyProdPayload),
    legacyTestTitle: getPositionTitle(legacyTestPayload),
    enterpriseName: getEnterpriseName(prodPayload),
    questionCount: getQuestionCount(prodPayload),
  }

  if (
    !result.prodTitle ||
    result.prodTitle !== expectedTitle ||
    result.legacyProdTitle !== result.prodTitle
  ) {
    result.status = 'FAIL'
    console.log(JSON.stringify(result, null, 2))
    process.exit(1)
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error('[verify-prod-mock-interview-legacy] failed:', error)
  process.exit(1)
})

#!/usr/bin/env node

const { randomUUID } = require('node:crypto')
const { spawn } = require('node:child_process')

const DEFAULT_WAIT_MS = 30_000

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

const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const required = (args, key) => {
  const value = args[key]
  if (!value) {
    throw new Error(`缺少参数 --${key}`)
  }
  return value
}

const login = async (apiUrl, phone, password) => {
  const response = await fetch(`${trimTrailingSlash(apiUrl)}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone,
      password,
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.access_token) {
    throw new Error(`登录失败: status=${response.status}, body=${JSON.stringify(payload)}`)
  }

  return payload.access_token
}

const dumpDomWithChrome = (chromePath, url, waitMs) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      chromePath,
      [
        '--headless=new',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        `--virtual-time-budget=${waitMs}`,
        '--dump-dom',
        url,
      ],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Chrome 执行失败: code=${code}, stderr=${stderr}`))
        return
      }
      resolve({ stdout, stderr })
    })
  })

const parseAutomationResult = (dom) => {
  const statusMatch = dom.match(/AUTOMATION_STATUS:\s*([A-Z]+)/)
  const base64Match = dom.match(/AUTOMATION_RESULT_B64:\s*([^<\n]+)/)

  const status = statusMatch ? statusMatch[1] : ''
  const result = base64Match
    ? JSON.parse(decodeURIComponent(base64Match[1].trim()))
    : null

  return {
    status,
    result,
  }
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const frontUrl = trimTrailingSlash(required(args, 'front-url'))
  const apiUrl = trimTrailingSlash(required(args, 'api-url'))
  const jobseekerPositionId = required(args, 'jobseeker-position-id')
  const expectedPositionName = args['expected-position-name'] || ''
  const waitMs = Number(args['wait-ms'] || DEFAULT_WAIT_MS)
  const chromePath = args['chrome-path'] || process.env.CHROME_BIN || 'google-chrome'

  let token = args.token || ''
  if (!token) {
    const phone = required(args, 'phone')
    const password = required(args, 'password')
    token = await login(apiUrl, phone, password)
  }

  const automationCaseId = args['automation-case-id'] || randomUUID()
  const params = new URLSearchParams({
    automation: 'mockInterview',
    autoRun: '1',
    automationCaseId,
    token,
    jobseekerPositionId: String(jobseekerPositionId),
  })

  if (expectedPositionName) {
    params.set('expectedPositionName', expectedPositionName)
  }

  const runnerUrl = `${frontUrl}/#/pages/test/index?${params.toString()}`
  console.log(`[mock-h5-check] runnerUrl=${runnerUrl}`)

  const { stdout } = await dumpDomWithChrome(chromePath, runnerUrl, waitMs)
  const { status, result } = parseAutomationResult(stdout)

  if (!status) {
    console.error(stdout)
    throw new Error('未在页面DOM中找到 AUTOMATION_STATUS 标记')
  }

  if (!result) {
    console.error(stdout)
    throw new Error('未在页面DOM中找到 AUTOMATION_RESULT_B64 标记')
  }

  console.log('[mock-h5-check] parsedResult=')
  console.log(JSON.stringify(result, null, 2))

  if (status !== 'PASS') {
    process.exitCode = 1
    return
  }
}

main().catch((error) => {
  console.error('[mock-h5-check] failed:', error)
  process.exit(1)
})

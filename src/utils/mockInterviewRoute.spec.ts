import assert from 'node:assert/strict'

import { buildAbsoluteH5ReloadUrl, getRelativeUniPathFromUrl, shouldReloadInterviewSession } from './url'

const run = () => {
  assert.equal(
    getRelativeUniPathFromUrl(
      'https://interview.ycjp-work.com/#/pages/camera/index/?token=abc&interviewId=1319&test=true',
    ),
    '/pages/camera/index?token=abc&interviewId=1319&test=true',
  )

  assert.equal(
    getRelativeUniPathFromUrl('/#/pages/camera/index/?token=abc&interviewId=1319'),
    '/pages/camera/index?token=abc&interviewId=1319',
  )

  assert.equal(
    getRelativeUniPathFromUrl('/pages/camera/index?token=abc&interviewId=1319'),
    '/pages/camera/index?token=abc&interviewId=1319',
  )

  assert.equal(
    buildAbsoluteH5ReloadUrl('/pages/camera/index?token=abc&interviewId=1319', 123),
    'https://interview.ycjp-work.com/?__reload__=123#/pages/camera/index?token=abc&interviewId=1319',
  )

  assert.equal(
    shouldReloadInterviewSession({
      nextInterviewId: 1319,
      lastLoadedInterviewId: null,
      hasLoadedCurrentInterview: false,
    }),
    true,
  )

  assert.equal(
    shouldReloadInterviewSession({
      nextInterviewId: 1319,
      lastLoadedInterviewId: 1318,
      hasLoadedCurrentInterview: true,
    }),
    true,
  )

  assert.equal(
    shouldReloadInterviewSession({
      nextInterviewId: 1319,
      lastLoadedInterviewId: 1319,
      hasLoadedCurrentInterview: true,
    }),
    false,
  )
}

run()
console.log('mockInterviewRoute.spec.ts passed')

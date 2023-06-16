import {
  readChangelogOfVersion,
  getPathOfPackages,
  convertLogsToMarkdown,
  convertLogsToSimpleString
} from '../src/read-rush'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

test('getPathOfPackages', () => {
  const res = getPathOfPackages('./__tests__/test-rush')

  expect(res).toEqual([
    {path: '__tests__/test-rush/rush-pkg-0', fileName: 'CHANGELOG.json'},
    {path: '__tests__/test-rush/rush-pkg-1', fileName: 'CHANGELOG.json'}
  ])
})

test('readChangelogOfVersion', () => {
  const res = readChangelogOfVersion(undefined, './__tests__/test-rush')

  expect(res).toEqual([
    {
      pkgName: 'rush-pkg-0',
      comments: ['init']
    }
  ])
})

test('convertLogsToMarkdown', () => {
  const changlog = readChangelogOfVersion('0.0.9', './__tests__/test-rush')

  expect(changlog).toEqual([
    {
      pkgName: 'rush-pkg-0',
      comments: ['fix: fix the bug of wrong use a util function']
    }
  ])

  const md = convertLogsToMarkdown(changlog)

  expect(md).toBe(`## 🐛 fix 
- **rush-pkg-0**: fix the bug of wrong use a util function
`)
})

test('convertLogsToSimpleString', () => {
  const changlog = readChangelogOfVersion('0.0.9', './__tests__/test-rush')

  expect(changlog).toEqual([
    {
      pkgName: 'rush-pkg-0',
      comments: ['fix: fix the bug of wrong use a util function']
    }
  ])

  const str = convertLogsToSimpleString(changlog)

  expect(str).toBe(`fix
rush-pkg-0:fix the bug of wrong use a util function`)
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_RUSH_PATH'] = './__tests__/test-rush'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})

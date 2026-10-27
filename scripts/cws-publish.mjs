#!/usr/bin/env node
// Uploads a zip to the Chrome Web Store and submits it for review (API v2).
//
// Usage: node scripts/cws-publish.mjs <path-to-zip> [--upload-only]
//
// Environment:
//   CWS_SERVICE_ACCOUNT_JSON  JSON key of the Google service account added in the
//                             Developer Dashboard (Account > Service account).
//   CWS_PUBLISHER_ID          Developer Dashboard > Publisher > Settings.
//   CWS_EXTENSION_ID          Optional; defaults to the published Lichess4Chess id.
//
// No dependencies: the service account key signs a JWT that is exchanged for an
// access token (https://developers.google.com/identity/protocols/oauth2/service-account).

import { createSign } from 'node:crypto'
import { readFileSync } from 'node:fs'

// CWS_API_BASE only exists to test against a local mock server.
const API = process.env.CWS_API_BASE || 'https://chromewebstore.googleapis.com'
const SCOPE = 'https://www.googleapis.com/auth/chromewebstore'
const DEFAULT_EXTENSION_ID = 'jenelhcabimbmbhoeejapoapolemplop'

const zipPath = process.argv[2]
const uploadOnly = process.argv.includes('--upload-only')
if (!zipPath) fail('Usage: node scripts/cws-publish.mjs <path-to-zip> [--upload-only]')

const publisherId = requireEnv('CWS_PUBLISHER_ID')
const extensionId = process.env.CWS_EXTENSION_ID || DEFAULT_EXTENSION_ID
const serviceAccount = parseServiceAccount(requireEnv('CWS_SERVICE_ACCOUNT_JSON'))
const itemPath = `publishers/${publisherId}/items/${extensionId}`

const token = await getAccessToken(serviceAccount)

console.log(`Uploading ${zipPath} to item ${extensionId}...`)
let upload = await api(`${API}/upload/v2/${itemPath}:upload`, token, {
  method: 'POST',
  headers: { 'Content-Type': 'application/zip' },
  body: readFileSync(zipPath),
})
console.log(JSON.stringify(upload, null, 2))

// Large packages are processed asynchronously: poll until the upload settles.
for (let attempt = 0; upload.uploadState === 'IN_PROGRESS' && attempt < 30; attempt++) {
  await sleep(Number(process.env.CWS_POLL_MS ?? 10_000))
  const status = await api(`${API}/v2/${itemPath}:fetchStatus`, token, { method: 'GET' })
  upload = { ...upload, uploadState: status.lastAsyncUploadState ?? upload.uploadState }
  console.log(`Upload state: ${upload.uploadState}`)
}
if (upload.uploadState !== 'SUCCEEDED') fail(`Upload did not succeed (state: ${upload.uploadState}).`)

if (uploadOnly) {
  console.log('Upload done; skipping publish (--upload-only).')
  process.exit(0)
}

console.log('Submitting for review...')
const publish = await api(`${API}/v2/${itemPath}:publish`, token, { method: 'POST' })
console.log(JSON.stringify(publish, null, 2))
console.log('Submitted. The new version goes live after the Chrome Web Store review.')

// ---------------------------------------------------------------- helpers

async function getAccessToken({ client_email, private_key, token_uri }) {
  const audience = token_uri || 'https://oauth2.googleapis.com/token'
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(JSON.stringify({ iss: client_email, scope: SCOPE, aud: audience, iat: now, exp: now + 3600 }))
  const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(private_key, 'base64url')

  const response = await fetch(audience, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.access_token) fail(`Could not get an access token (${response.status}): ${JSON.stringify(data)}`)
  return data.access_token
}

async function api(url, token, init) {
  const response = await fetch(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } })
  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }
  if (!response.ok) fail(`${init.method} ${url} failed (${response.status}): ${JSON.stringify(data)}`)
  return data
}

function parseServiceAccount(raw) {
  try {
    const parsed = JSON.parse(raw)
    if (parsed.client_email && parsed.private_key) return parsed
  } catch {
    // Fall through.
  }
  fail('CWS_SERVICE_ACCOUNT_JSON is not a valid service account JSON key.')
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) fail(`Missing environment variable ${name}.`)
  return value
}

function base64url(text) {
  return Buffer.from(text).toString('base64url')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fail(message) {
  console.error(`::error::${message}`)
  process.exit(1)
}

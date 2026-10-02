// Runs with `npm test` (node --test). No network: fetch is replaced with a fake
// TLDers endpoint, and the server is connected to a client in memory.
import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createServer, VERSION } from '../index.js'

const TOOLS = [
  'find_cheapest_tlds',
  'get_tld_prices',
  'compare_tlds',
  'get_tld_price_history',
  'list_promo_codes',
  'check_domain_availability',
  'list_registrars',
]

const realFetch = globalThis.fetch
let requests

async function connect() {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'test', version: '0.0.0' })
  await Promise.all([createServer().connect(serverSide), client.connect(clientSide)])
  return client
}

beforeEach(() => {
  requests = []
  process.env.TLDERS_API_KEY = 'test-key'
  process.env.TLDERS_MCP_URL = 'https://example.test/api/mcp'
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body)
    requests.push({ url, headers: init.headers, body })
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: body.id,
      result: { content: [{ type: 'text', text: `ok ${body.params.name}` }] },
    }))
  }
})

afterEach(() => {
  globalThis.fetch = realFetch
  delete process.env.TLDERS_API_KEY
  delete process.env.TLDERS_MCP_URL
})

test('lists all seven tools', async () => {
  const { tools } = await (await connect()).listTools()
  assert.deepEqual(tools.map((t) => t.name).sort(), [...TOOLS].sort())
})

test('every tool is annotated as read-only and non-destructive', async () => {
  const { tools } = await (await connect()).listTools()
  for (const t of tools) {
    assert.equal(t.annotations?.readOnlyHint, true, `${t.name} readOnlyHint`)
    assert.equal(t.annotations?.destructiveHint, false, `${t.name} destructiveHint`)
    assert.equal(t.annotations?.idempotentHint, true, `${t.name} idempotentHint`)
    assert.equal(t.annotations?.openWorldHint, true, `${t.name} openWorldHint`)
    assert.ok(t.title, `${t.name} has a title`)
    assert.ok(t.description, `${t.name} has a description`)
  }
})

const sampleArgs = {
  find_cheapest_tlds: { sort: 'price_asc', limit: 5 },
  get_tld_prices: { tld: 'com' },
  compare_tlds: { tlds: ['com', 'io'] },
  get_tld_price_history: { tld: 'ai' },
  list_promo_codes: { limit: 3 },
  check_domain_availability: { domain: 'example.com' },
  list_registrars: {},
}

for (const name of TOOLS) {
  test(`${name} forwards the call with the API key`, async () => {
    const result = await (await connect()).callTool({ name, arguments: sampleArgs[name] })
    assert.equal(result.content[0].text, `ok ${name}`)
    assert.equal(requests.length, 1)
    const [req] = requests
    assert.equal(req.url, 'https://example.test/api/mcp')
    assert.equal(req.headers.authorization, 'Bearer test-key')
    assert.equal(req.headers['user-agent'], `tlders-mcp/${VERSION}`)
    assert.equal(req.body.method, 'tools/call')
    assert.equal(req.body.params.name, name)
    assert.deepEqual(req.body.params.arguments, sampleArgs[name])
  })
}

test('rejects invalid arguments before calling TLDers', async () => {
  const result = await (await connect()).callTool({ name: 'list_promo_codes', arguments: { limit: 500 } })
  assert.equal(result.isError, true)
  assert.equal(requests.length, 0)
})

test('explains a missing API key without calling TLDers', async () => {
  delete process.env.TLDERS_API_KEY
  const result = await (await connect()).callTool({ name: 'get_tld_prices', arguments: { tld: 'com' } })
  assert.equal(result.isError, true)
  assert.match(result.content[0].text, /TLDERS_API_KEY is not set/)
  assert.equal(requests.length, 0)
})

test('passes on errors from TLDers', async () => {
  globalThis.fetch = async (url, init) =>
    new Response(JSON.stringify({ jsonrpc: '2.0', id: JSON.parse(init.body).id, error: { code: -32001, message: 'Invalid API key' } }))
  const result = await (await connect()).callTool({ name: 'get_tld_prices', arguments: { tld: 'com' } })
  assert.equal(result.isError, true)
  assert.equal(result.content[0].text, 'Invalid API key')
})

test('reports network failures', async () => {
  globalThis.fetch = async () => { throw new Error('offline') }
  const result = await (await connect()).callTool({ name: 'list_registrars', arguments: {} })
  assert.equal(result.isError, true)
  assert.match(result.content[0].text, /Could not reach TLDers: offline/)
})

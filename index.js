#!/usr/bin/env node
// Local (stdio) MCP server for TLDers domain prices. Each tool forwards to
// the hosted server at https://www.tlders.com/api/mcp with your API key, so
// prices are always live. Set TLDERS_API_KEY (free key:
// https://www.tlders.com/developers).

import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

export const VERSION = '1.0.1'

// Every tool only reads data: nothing is created, changed or deleted, and repeating a
// call is harmless. They call the TLDers API (and registries), hence openWorldHint.
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }

async function callRemote(name, args) {
  // Read on each call so tests (and long-lived hosts) can change them.
  const ENDPOINT = process.env.TLDERS_MCP_URL || 'https://www.tlders.com/api/mcp'
  const API_KEY = process.env.TLDERS_API_KEY || ''
  if (!API_KEY) {
    return {
      content: [{ type: 'text', text: 'TLDERS_API_KEY is not set. Get a free key at https://www.tlders.com/developers and add it to this server\'s env.' }],
      isError: true,
    }
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        authorization: `Bearer ${API_KEY}`,
        'user-agent': `tlders-mcp/${VERSION}`,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
    })
    const body = await res.json()
    if (body.error) return { content: [{ type: 'text', text: body.error.message || 'Request failed.' }], isError: true }
    return body.result
  } catch (err) {
    return { content: [{ type: 'text', text: `Could not reach TLDers: ${err instanceof Error ? err.message : err}` }], isError: true }
  }
}

export function createServer() {
  const server = new McpServer({ name: 'tlders', title: 'TLDers Domain Prices', version: VERSION })

  const tld = z.string().describe('Extension without the dot, e.g. "com", "io" or "co.in"')

  server.registerTool(
    'find_cheapest_tlds',
    {
      title: 'Find cheapest TLDs',
      annotations: { title: 'Find cheapest TLDs', ...READ_ONLY },
      description:
        'List domain extensions (TLDs) with the cheapest registrar for first-year registration, renewal, transfer and 3-year total. Prices in USD/year.',
      inputSchema: {
        sort: z.enum(['popularity', 'price_asc', 'price_desc']).optional(),
        q: z.string().optional().describe('Only TLDs containing this text, e.g. "ai"'),
        type: z.enum(['gtld', 'cctld']).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
    },
    (args) => callRemote('find_cheapest_tlds', args)
  )

  server.registerTool(
    'get_tld_prices',
    {
      title: 'Get TLD prices',
      annotations: { title: 'Get TLD prices', ...READ_ONLY },
      description: 'Every registrar\'s current register / renew / transfer price for one extension, cheapest first, plus average and median.',
      inputSchema: { tld },
    },
    (args) => callRemote('get_tld_prices', args)
  )

  server.registerTool(
    'compare_tlds',
    {
      title: 'Compare TLDs',
      annotations: { title: 'Compare TLDs', ...READ_ONLY },
      description: 'Compare registrar prices across up to 20 extensions side by side.',
      inputSchema: { tlds: z.array(z.string()).min(1).max(20) },
    },
    (args) => callRemote('compare_tlds', args)
  )

  server.registerTool(
    'get_tld_price_history',
    {
      title: 'Get TLD price history',
      annotations: { title: 'Get TLD price history', ...READ_ONLY },
      description: 'Per-registrar registration and renewal price history for one extension.',
      inputSchema: { tld },
    },
    (args) => callRemote('get_tld_price_history', args)
  )

  server.registerTool(
    'list_promo_codes',
    {
      title: 'List promo codes',
      annotations: { title: 'List promo codes', ...READ_ONLY },
      description: 'Currently active registrar promo/coupon codes, biggest discount first.',
      inputSchema: { limit: z.number().int().min(1).max(100).optional() },
    },
    (args) => callRemote('list_promo_codes', args)
  )

  server.registerTool(
    'check_domain_availability',
    {
      title: 'Check domain availability',
      annotations: { title: 'Check domain availability', ...READ_ONLY },
      description: 'Live availability check for a full domain name (RDAP, WHOIS fallback). available is null if the registry could not be reached.',
      inputSchema: { domain: z.string().describe('Full domain, e.g. "example.com"') },
    },
    (args) => callRemote('check_domain_availability', args)
  )

  server.registerTool(
    'list_registrars',
    {
      title: 'List registrars',
      annotations: { title: 'List registrars', ...READ_ONLY },
      description: 'Every domain registrar TLDers tracks, with WHOIS-privacy info and number of tracked TLDs.',
      inputSchema: {},
    },
    () => callRemote('list_registrars', {})
  )

  return server
}

// Started as a command (npx @tlders/mcp): serve over stdio. Imported (tests): do nothing.
const isMain = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
if (isMain) {
  await createServer().connect(new StdioServerTransport())
}

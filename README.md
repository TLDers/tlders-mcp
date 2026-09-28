# TLDers Domain Prices — MCP server

Live domain prices from 145+ registrars and 1,100+ TLDs, as a remote [Model Context Protocol](https://modelcontextprotocol.io) server. Ask your AI assistant where a domain is cheapest to register, renew or transfer, compare extensions, find promo codes and check availability — with real, daily-updated prices from [TLDers](https://www.tlders.com).

Use it two ways: connect to the hosted server at `https://www.tlders.com/api/mcp`, or run this repository's small local (stdio) server, which forwards each tool call to the hosted one with your key.

## Connect

1. Get a free API key at https://www.tlders.com/developers (no card needed).
2. Add a remote MCP server (Streamable HTTP):

| Client | Setting |
| --- | --- |
| Clients that support headers (Claude Code, Cursor, VS Code, MCP Inspector) | URL `https://www.tlders.com/api/mcp`, header `Authorization: Bearer tld_live_...` |
| claude.ai custom connectors and other clients without header support | URL `https://www.tlders.com/api/mcp?key=tld_live_...` |

Claude Code:

```sh
claude mcp add --transport http tlders https://www.tlders.com/api/mcp \
  --header "Authorization: Bearer tld_live_..."
```

Treat a URL with `?key=` like a password. If it leaks, revoke the key from your TLDers account and create a new one.

### Local (stdio) server

For Claude Desktop's config file and other clients that run local servers. Needs Node.js 18+.

```json
{
  "mcpServers": {
    "tlders": {
      "command": "npx",
      "args": ["-y", "@tlders/mcp"],
      "env": { "TLDERS_API_KEY": "tld_live_..." }
    }
  }
}
```

To run the server from source instead of the published package (useful while changing it), clone this repo, run `npm install`, then use `"command": "node", "args": ["/path/to/tlders-mcp/index.js"]`. It reads the same `TLDERS_API_KEY` variable, and `TLDERS_MCP_URL` overrides the hosted endpoint.

### Plugin install

This repo is also an [Agent Plugins](https://agent-plugins.org) package (`plugin.json` + `mcp.json`) that connects to the hosted server. Once installed, add your key by passing it as the `api_key` argument or switching the server URL to `https://www.tlders.com/api/mcp?key=tld_live_...`.

## Tools

| Tool | What it does |
| --- | --- |
| `find_cheapest_tlds` | Cheapest registrar per extension for first-year registration, renewal, transfer and 3-year total |
| `get_tld_prices` | Every registrar's register / renew / transfer price for one extension, cheapest first |
| `compare_tlds` | Compare registrar prices across up to 20 extensions |
| `get_tld_price_history` | Per-registrar registration and renewal price history |
| `list_promo_codes` | Active registrar promo codes, biggest discount first |
| `check_domain_availability` | Live availability for a full domain name (RDAP, WHOIS fallback) |
| `list_registrars` | Every tracked registrar with WHOIS-privacy info |

Prices are USD per year. First-year prices are often promotions, so the renewal price is always included.

## Example prompts

- "Where is a .com cheapest to register and to renew?"
- "Compare .io, .ai and .dev prices over three years."
- "Is my-startup.dev available, and which registrar should I buy it from?"
- "Are there any promo codes for .xyz right now?"

## Plans

| Plan | Limit |
| --- | --- |
| Free | 100 requests a month, one key |
| Monthly ($5) / Yearly | 1,000 requests a day per key, up to 5 keys, plus bulk prices |

Full API docs and the OpenAPI spec: https://www.tlders.com/developers

## Support

advertise@tlders.com

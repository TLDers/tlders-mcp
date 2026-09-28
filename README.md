# TLDers Domain Prices — MCP server

Live domain prices from 145+ registrars and 1,100+ TLDs, as a remote [Model Context Protocol](https://modelcontextprotocol.io) server. Ask your AI assistant where a domain is cheapest to register, renew or transfer, compare extensions, find promo codes and check availability — with real, daily-updated prices from [TLDers](https://www.tlders.com).

This repository holds the listing files only (`server.json` for the [official MCP Registry](https://registry.modelcontextprotocol.io), `LAUNCHGUIDE.md` for directories). The server itself is hosted at `https://www.tlders.com/api/mcp`.

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

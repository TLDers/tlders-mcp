# TLDers Domain Prices

## Tagline
Live domain prices across 145+ registrars and 1,100+ TLDs — cheapest registration, renewal and transfer, promo codes and availability, via MCP.

## Description
TLDers tracks what every major domain registrar charges to register, renew and transfer 1,100+ domain extensions, updated daily from registrar price lists and APIs. This remote MCP server exposes that data as tools, so an AI assistant can answer "where is .ai cheapest to keep?" or "compare .com, .io and .dev" with real, current prices instead of guesses from training data.

Every answer comes from the live TLDers database: per-registrar prices in USD per year, minimum registration terms, renewal and transfer prices, 3-year totals, price history, active promo codes and a live RDAP/WHOIS availability check. First-year promotional prices are shown alongside the renewal price, so the cheapest registrar to keep a domain is clear — not just the cheapest to buy it.

Built for developers, founders and agent builders who need domain pricing in a workflow: naming and branding assistants, startup-launch copilots, portfolio and renewal audits, and general-purpose agents that get asked "which registrar should I use?"

## Setup Requirements
- `Authorization` (required): `Bearer <your TLDers API key>` (or send the key as `X-API-Key`). Get a free key at https://www.tlders.com/developers — no card needed. Clients that can't set headers (such as claude.ai custom connectors) can use `https://www.tlders.com/api/mcp?key=<your key>` as the server URL, or pass the key as an `api_key` argument on each tool call. Free keys get 100 requests a month; paid plans (from $5/month) get 1,000 requests a day per key and the bulk prices endpoint.

## Category
Developer Tools

## Features
- Cheapest registrar per extension for first-year registration, renewal, transfer and 3-year total
- Every registrar's current price for one extension, cheapest first, with average and median
- Side-by-side comparison of up to 20 extensions
- Per-registrar registration and renewal price history
- Active registrar promo and coupon codes, biggest discount first
- Live domain availability check (RDAP with WHOIS fallback)
- 145+ registrars and 1,100+ TLDs, including country codes like .in, .co.uk and .de, updated daily
- Free tier (100 requests/month); paid plans from $5/month

## Getting Started
- "Where is a .com cheapest to register and to renew?"
- "Compare .io, .ai and .dev prices over three years"
- "Is tlders-example.com available, and where should I buy it?"
- "Are there any promo codes for .xyz right now?"
- "How has the price of .ai changed at Namecheap?"
- Tool: find_cheapest_tlds — cheapest registrar per extension, sortable and filterable
- Tool: get_tld_prices — every registrar's register/renew/transfer price for one extension
- Tool: compare_tlds — compare registrar prices across up to 20 extensions
- Tool: get_tld_price_history — per-registrar price history for one extension
- Tool: list_promo_codes — active registrar promo codes
- Tool: check_domain_availability — live availability for a full domain name
- Tool: list_registrars — every tracked registrar with WHOIS-privacy info

## Tags
domains, domain-prices, registrars, tld, domain-availability, pricing, promo-codes, dns, startups, developer-tools

## Documentation URL
https://www.tlders.com/developers

## Health Check URL
https://www.tlders.com/openapi.json

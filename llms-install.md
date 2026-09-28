# Installing the TLDers Domain Prices MCP server

Instructions for AI agents (Cline and others) setting this server up for a user.

## 1. Get an API key

The server needs a TLDers API key. Ask the user for one. If they don't have one, tell them to create a free key at https://www.tlders.com/developers (sign up, then Account → API → Create key; no card needed). Keys look like `tld_live_...`.

## 2. Add the server

No clone or build is needed. Add this to the MCP settings (for Cline: `cline_mcp_settings.json`), putting the user's key in `TLDERS_API_KEY`:

```json
{
  "mcpServers": {
    "tlders": {
      "command": "npx",
      "args": ["-y", "@tlders/mcp"],
      "env": { "TLDERS_API_KEY": "tld_live_..." },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Requires Node.js 18 or newer.

If the client supports remote (Streamable HTTP) servers, this works instead of the local package:

- URL: `https://www.tlders.com/api/mcp`
- Header: `Authorization: Bearer tld_live_...`

## 3. Check it works

Call `get_tld_prices` with `{"tld": "com"}`. It should return a list of registrars with register, renew and transfer prices.

- "TLDERS_API_KEY is not set": the `env` block is missing or the key is empty.
- "Invalid or revoked API key": the key was mistyped or revoked; create a new one at https://www.tlders.com/developers.
- "Rate limit exceeded": free keys allow 100 requests a month; paid plans allow 1,000 a day.

## Tools

`find_cheapest_tlds`, `get_tld_prices`, `compare_tlds`, `get_tld_price_history`, `list_promo_codes`, `check_domain_availability`, `list_registrars`. Prices are USD per year; always mention the renewal price, since first-year prices are often promotions.

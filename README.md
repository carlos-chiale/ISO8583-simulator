### ISO 8583 Simulator

An interactive web app to simulate POS transactions and visualize ISO 8583 messages. Includes a POS-like terminal UI, form-based entry, EMV tags, multi-currency support (including UYU), transaction history, and an optional network mode to POST messages to a real server.

### Features

- **POS terminal simulation**: Chip, contactless, and swipe flows with PIN entry and result screens
- **Form-based transactions**: Quickly craft requests with processing code, amount, PAN, expiry, and more
- **ISO 8583 message viewer**: Human-friendly formatted view and raw wire format side-by-side
- **EMV tags**: Toggle default EMV tags or input your own
- **Multi-currency**: Currency select with numeric code mapping (USD, UYU, EUR, GBP, JPY, …)
- **Transaction history**: Browse and replay past transactions
- **Network mode**: Configurable host/port/SSL/timeout; built-in connection test and response parsing

### Quick start

Requirements:

- Node.js 20+ recommended
- pnpm, npm, or yarn (examples use pnpm; substitute as needed)

Install and run locally:

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

Useful scripts:

```bash
pnpm build      # production build
pnpm start      # start production server
pnpm lint       # run Next.js lint
```

### Using the app

- **Form flow**: Fill fields and send. The right panel shows the formatted ISO 8583 message and wire format, plus the simulated/real response.
- **Terminal flow**: Click “POS Terminal” in the header, choose Sale/Refund/Balance/Withdrawal, enter amount/currency, pick Chip/Contactless/Swipe, and follow prompts (PIN if required).
- **History**: The History tab lists prior transactions; selecting one regenerates its message/response.

### Network mode

By default the app simulates responses locally. Enable network mode to POST transactions to a server.

- Open the network settings from the header status and toggle **Enable Network Mode**
- Configure `host`, `port`, `timeout`, and `Use SSL/HTTPS`
- Use “Test Connection” which calls `GET /health` on your server

When enabled, transactions are sent to:
`http(s)://{host}:{port}/iso8583`

Request body example:

```json
{
  "transaction": {
    /* Transaction fields from the UI */
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

Your server can either return a fully formatted response:

```json
{
  "formatted": "ISO8583 Response:\nMTI: 0210\nField 039 (Response Code): 00\n…",
  "wire": "0210…"
}
```

Or a minimal structure the app will parse into ISO 8583 format:

```json
{
  "approved": true,
  "responseCode": "00",
  "responseMessage": "APPROVED",
  "authCode": "ABC123",
  "additionalFields": ""
}
```

Health check endpoint used by the UI tester:

- `GET /health` → expect 200 OK

### ISO 8583 implementation notes

- The formatter in `lib/iso8583.ts` builds a simplified message with common fields (e.g., 0 MTI, 2 PAN, 3 Processing Code, 4 Amount, 7/12/13 timestamps, 14 Expiry, 22 Entry Mode, 41/42 terminal/merchant, 49 Currency, 55 EMV, 64 MAC placeholder). The wire format is illustrative and not production-grade.
- Currency numeric codes include `USD: 840`, `UYU: 858`, `EUR: 978`, `GBP: 826`, `JPY: 392`, etc.
- This project is intended for education/demos and omits real cryptography, bitmaps, and key management.

### Project structure

```
app/                # Next.js app router pages/layout
components/         # UI components, POS terminal, forms, viewers
lib/                # ISO 8583 formatting and network service
styles/, public/    # Styling and static assets
```

Key files:

- `lib/iso8583.ts` — message formatting and wire generation
- `lib/network-service.ts` — network POST and response parsing
- `components/terminal-interface.tsx` — POS terminal simulation
- `components/transaction-form.tsx` — form-based transactions
- `components/message-viewer.tsx` — formatted/wire message viewer

### Tech stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS, Radix UI, shadcn-inspired components

### Deployment

Deployed on Vercel. Push to the default branch to trigger a deployment.

### Notes

- Not a full ISO 8583 implementation. Do not use in production for real transactions.
- Contains a convenient sync with `v0.dev` for iterative UI building.

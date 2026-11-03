# KAISH usage analytics

The React app sends events to `https://kaish-analytics.kaish-study-research.workers.dev` only after visitors choose **Allow analytics**. The notice names the collected fields, including raw IP addresses, and offers **Decline** and **Stop tracking**.

`src/VisitorAnalytics.tsx` displays the notice. `src/analytics.ts` handles consent, tab sessions, clicks, visible-tab time and exercise attempts. Submission handlers in `src/App.tsx` mark attempts completed after the existing app checks. Names, form values and answers are excluded from the analytics payload.

The Worker stores events in D1. `/admin` provides a password-protected report. Set `ADMIN_TOKEN` as a Cloudflare secret (32–256 characters); never put it in source, a `VITE_*` variable, or a URL. The admin page keeps it only in memory. D1 IDs and the collector URL are public configuration, not credentials.

## Maintain the deployed Worker

Run from this directory with a Cloudflare account that can access the configured account/database:

```sh
npx wrangler login
npx wrangler deploy
```

To rotate the admin password:

```sh
npx wrangler secret put ADMIN_TOKEN
```

The existing D1 database is already initialized. `schema.sql` is idempotent if a schema check is needed:

```sh
npx wrangler d1 execute kaish-analytics --remote --file schema.sql
```

Run backend checks on Node.js 24+:

```sh
node --test worker.test.mjs
```

## Report definitions and limits

- Sessions are random browser-tab identifiers, not unique people or verified accounts.
- Time is visible-tab time, sampled about every 15 seconds; it does not measure attention.
- A lesson attempt starts when an exercise opens. A completion means the app accepted a submit action, not a perfect score or confirmed delivery to Google Sheets.
- Abandonment means leaving an unsubmitted attempt or no recorded lesson activity for 30 minutes. Later completion updates that classification. Ongoing attempts are shown separately; percentages use all starts in the reporting window.
- Button labels use `data-analytics` where present and DOM position otherwise; no button text or input contents are sent.
- Browser/device information is inferred from User-Agent. It may be incomplete or spoofed and does not reveal a private device name. IPs may belong to VPNs or shared networks.
- Declining permission, ad blockers, lost requests and rate limits reduce coverage. This is research telemetry, not an audit log. Public collection endpoints can receive forged events; Origin checks and rate limits do not authenticate visitors.
- The report shows up to 30 days of data. A daily Cron deletes older rows from the events table; backup retention is governed separately by Cloudflare. Withdrawing consent stops new events but does not erase existing rows automatically.
- The lesson table shows at most 100 lesson groups; event history is paginated in batches of 100. Clicking a session filters its history.
- The per-IP collector rate limit is approximate and local to each Cloudflare location; shared networks can share a limit. Configure unique rate-limit namespace IDs if adding other Workers to this account.

The website remains hosted on GitHub Pages. This integration does not require changing Namecheap DNS.

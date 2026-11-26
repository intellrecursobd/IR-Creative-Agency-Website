# IntellRecurso Creative — developer handoff

This ZIP contains the latest published source for IntellRecurso Creative, including the OVC, TVC, AVC & brand films, and influencer marketing additions.

## Main files

- `app/components/AgencySite.tsx` — page sections, work filters, service details and enquiry form.
- `app/lib/agency.ts` — service names, descriptions, deliverables and work cards.
- `app/globals.css` — styling and responsive layouts.
- `app/layout.tsx` — site title and search/social metadata.
- `app/api/enquiries/route.ts` — project enquiry endpoint.
- `app/inbox/page.tsx` — protected enquiry inbox.
- `public/` — images, fonts and media.
- `db/` and `drizzle/` — database schema and migrations.

## Setup

This is a React/Vinext project running on a Cloudflare Worker. It is not a static HTML export. The included scripts target Linux; Windows users can use WSL.

Requirements: Node.js >=22.13.0, npm, Git, curl, flock and GNU timeout.

```sh
npm run install:ci
npm run dev
```

Production build:

```sh
npm run build
```

The existing enquiry backend uses a Cloudflare D1 binding named `DB`. An independent deployment needs its own database and the included migrations. The inbox uses Sites-managed ChatGPT sign-in headers; a different hosting platform needs an equivalent authentication integration before exposing that inbox.

## Existing site and custom domain

Published site: https://eclipse-404-access-2026.rahmansharmin.chatgpt.site/
Requested custom domain: intellrecursocreative.com

The custom domain can be connected to the existing hosted site without migrating the source. It requires access to the site's domain settings and the domain's DNS controls. This ZIP does not grant editor or DNS access.

## Export information

Source commit: d0e055f654595c9d5e0da7e0b037ebc7f1fd312f
Export date: 26 November 2026

The archive contains tracked source and assets. It excludes Git credentials, dependency installations, runtime secrets and live database records. Do not treat this archive as a backup of submitted enquiries.

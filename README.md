nKrishi-Vipani — Local Verification Guide

Quick Start

- Install dependencies:

```bash
npm install
```

- Run development server:

```bash
npm run dev
```

- Open in browser:

http://localhost:3000

What to verify

- Responsive breakpoints: 320px / 375px / 425px / 768px / 1024px / 1440px
- Sidebar: visible on desktop, hamburger on mobile, overlay closes sidebar
- Language: default English; switch via navbar select (persists in localStorage)
- Scanner: upload images, check validation (image type, max 5MB)
- AI Assistant: open `/assistant` and verify chat UI loads
- Weather / Mandi / Marketplace pages: check loading states and empty states
- No horizontal scroll; content centered (max-w-7xl + px-4/md:px-6)

Notes

- Default language is English (html lang set to `en`).
- Global content is wrapped with `max-w-7xl mx-auto px-4 md:px-6 py-4` for consistent spacing.
- If you see hydration mismatches, ensure you clear browser cache and localStorage (`krishakvipani-lang`).

Security & Stability

- Server secrets are loaded from environment; do not commit `.env` values.
- APIs include try/catch at runtime; inspect server APIs under `app/api` for further hardening.

If you want, I can continue scanning specific pages and fix any remaining issues.

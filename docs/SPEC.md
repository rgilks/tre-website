# tre.systems — Full Technical Specification

**Owner/Brand:** Total Reality Engineering
**Domain:** tre.systems
**Primary Goal:** A minimal, flashy portfolio that lists public GitHub projects using screenshots from `docs/screenshot.*`, descriptions from each repo, shows the latest activity first with a "Currently working on" highlight, and provides buttons for **Website** (if any) and **GitHub**. Some projects may also include **YouTube videos** for demonstration purposes.

**Key Constraints**

- Deploy as a **Cloudflare Worker** using **OpenNext**.
- **Next.js App Router** with **Server Components** + **Server Actions only** (no public API routes).
- Styling with **Tailwind CSS**; micro‑interactions with **Framer Motion**.
- Brand theme: **black background**, **terminal green + white** foreground accents.
- Data caching at the edge with **Cloudflare KV**, plus **Cron Triggers** for refresh.
- **Cloudflare Image Resizing** (`/cdn-cgi/image`) for responsive thumbnails from raw GitHub URLs.
- **PWA support** with offline caching, manifest, and service worker.

---

## PWA Requirements

- **Web App Manifest**: includes TRE name, icons, background color black, theme color terminal green.
- **Service Worker**: precaches critical assets (fonts, CSS, JS) and project list JSON; uses runtime caching for images and screenshots.
- **Installable**: passes Lighthouse PWA installable checks.
- **Offline**: home page + cached project thumbnails available offline.

---

## Project Detail View ✅ IMPLEMENTED

- Clicking a project opens a **dedicated detail route**: `/project/[name]`.
- **Iframe embedding**: Projects are displayed in responsive iframes (all subdomains of tre.systems).
- **YouTube video support**: If a project has a `youtubeUrl` field, display an embedded YouTube video player above the iframe.
- **Overlay**: Bottom-right corner shows the TRE logo with a green glow; clicking it returns to the home page.
- **Reliable embedding**: All project websites are subdomains (e.g., geno-1.tre.systems) ensuring consistent iframe functionality.
- Project detail page shows description, topics, GitHub button, and YouTube video if available.

---

## Architecture Overview

_(unchanged from previous spec except for PWA and project detail additions)_

- Next.js (App Router) → Cloudflare Workers via OpenNext.
- Server actions handle all data fetching.
- KV for caching project list.
- Cron refresh.
- Image Resizing for thumbnails.
- PWA manifest + service worker.
- New project detail route with iframe overlay and YouTube video support.

---

## Pages & Components (Additions)

```
app/
  project/[name]/page.tsx  // Server component: loads project details, shows iframe or fallback
components/
  ProjectViewer.tsx        // Contains iframe, YouTube video, and overlay logo link
  YouTubeEmbed.tsx         // Responsive YouTube video embed component
  TRELogo.tsx              // TRE logo component used in overlay
public/
  manifest.json            // PWA manifest (TODO)
  icons/                   // PWA icons in multiple sizes (TODO)
```

---

## Project Detail UI

- **YouTube Video**: If `youtubeUrl` exists, display a responsive YouTube embed above the iframe or as the primary content.
- **Iframe**: fills viewport below header (or below video if present); `sandbox` attributes to allow scripts/forms unless restricted by target.
- **OverlayLogo**: fixed bottom-left, clickable, green glow; visible over iframe content.
- **Fallback**: if iframe cannot load, display screenshot, description, YouTube video (if available), and a prominent "Open Project" button.

---

## Acceptance Criteria (Updated)

1. ✅ Home renders with hero + project list.
2. ✅ Most recent project highlighted.
3. ✅ Each card shows screenshot, description, Website (if available), GitHub.
4. ✅ Clicking Website button opens `/project/[name]` detail page with iframe.
5. ✅ If `youtubeUrl` exists, display embedded YouTube video prominently.
6. ✅ If homepageUrl exists, load in iframe (all subdomains of tre.systems).
7. ✅ Overlay TRE logo links back to `/`.
8. ⏳ PWA passes Lighthouse checks: installable, offline home + cached thumbnails.
9. ✅ KV caching, cron refresh, images via CF Resizing.
10. ✅ Brand: black, terminal green, white accents.
11. ⏳ Deployed at [https://tre.systems](https://tre.systems).

---

## 23) PWA (Installable + Offline)

**Goals**

- Installable on desktop/mobile with TRE branding.
- Fast repeat visits with offline support for the **home** (hero + featured + grid) and cached images.
- Graceful offline experience for project viewer.

**Manifest** (`app/manifest.webmanifest`)

```json
{
  "name": "Total Reality Engineering",
  "short_name": "TRE",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#39FF14",
  "icons": [
    {
      "src": "/icon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    { "src": "/apple-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```

**`layout.tsx` additions**

- Link to manifest: `<link rel="manifest" href="/manifest.webmanifest" />`
- Theme color meta: `<meta name="theme-color" content="#39FF14" />`
- Apple tags for iOS standalone (optional):

  ```html
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta
    name="apple-mobile-web-app-status-bar-style"
    content="black-translucent"
  />
  ```

**Service Worker** (`public/sw.js`)

- Strategy (no APIs required):
  - **Precache** build assets (Next JS/CSS, fonts), `/` route shell, and `/offline` page.
  - **Runtime caching** (stale‑while‑revalidate):
    - Same‑origin navigations (`/`) → respond from cache, update in background.
    - Images from `/cdn-cgi/image/*` → cache up to \~100 entries, 7‑day max.
    - Raw GitHub screenshots (`https://raw.githubusercontent.com/*`) → opaque responses cached best‑effort with short TTL.

  - **Fallbacks**: if navigation offline and not in cache → serve `/offline` with branded message.

- Register SW in a tiny client script (`lib/pwa.ts`), imported once in `layout.tsx` via a client component wrapper that runs `navigator.serviceWorker.register('/sw.js')`.

**Install Prompt (optional)**

- Detect `beforeinstallprompt`; show a small, dismissible bottom‑right install chip in TRE green when eligible (respect `PWA_INSTALL_PROMPT_DISABLED` flag).

---

## 24) Project Viewer Route (Embedded + YouTube)

**Route**: `/project/[owner]/[repo]`

**Behavior**

1. Server component resolves the project from the cached feed (`getProjects()`), finds `homepageUrl` and `youtubeUrl`.
2. **YouTube Video**: If `youtubeUrl` exists, display a responsive YouTube embed at the top of the page.
3. **Embed check** (server‑side): attempt a `HEAD` to `homepageUrl` and inspect headers:
   - If `x-frame-options` is `DENY`/`SAMEORIGIN`, or CSP `frame-ancestors` excludes our origin → mark as **blocked**.

4. Render:
   - **Allowed** → `<ProjectViewer>` client component renders an `<iframe>` of `homepageUrl` with:
     - `sandbox="allow-scripts allow-forms allow-same-origin allow-popups"`
     - `referrerpolicy="no-referrer-when-downgrade"`
     - `allowfullscreen` and `loading="lazy"`

   - **Blocked** → display a branded fallback: large screenshot (if any), description, YouTube video (if available), and two buttons: **Open Website** (new tab) and **GitHub**.

5. **TRE overlay logo**: fixed bottom‑left, circular 56px button (green on black, subtle glow). Clicking returns to Home (`/`).
   - Accessible label: `aria-label="Back to Total Reality Engineering"`.
   - Keyboard reachable and visible focus ring.

**YouTube Integration**

- **Video Embed**: Use YouTube's iframe embed API with responsive design.
- **Video Position**: Display above the project iframe or as primary content if no iframe.
- **Responsive Design**: Video maintains 16:9 aspect ratio across all screen sizes.
§- **Performance**: Lazy load YouTube embeds to improve page load performance.

**CSP / Security**

- App CSP should permit framing external sites we attempt to embed: `frame-src https:;` (or a curated allowlist if preferred). We cannot bypass third‑party frame restrictions.

**Offline**

- If viewing a project and connection drops, show an inline offline message with a **Retry** button; if iframe fails, keep the overlay logo and provide links.

---

## 25) Acceptance Criteria Additions (PWA + Viewer + YouTube)

- The site passes Lighthouse PWA installable checks (manifest, service worker, theme color, 512px icon).
- With the network disabled after a first visit, the **home page** loads from cache with previously seen project thumbnails.
- `/project/[owner]/[repo]` shows the external site in an iframe **when allowed**; otherwise, the fallback panel appears with Website and GitHub buttons.
- If a project has a `youtubeUrl`, the YouTube video is prominently displayed and responsive.
- A persistent **TRE overlay logo** appears bottom‑left on the project viewer and links back to Home.

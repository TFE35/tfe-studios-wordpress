# TFE Studios Motion — WordPress Theme Starter v0.1.0

**Status:** Prototype conversion / pre-production. This theme is **not yet deployed** and has **not been tested in a live WordPress runtime**. PHP template syntax and JavaScript syntax have been checked locally.

## Origin

Built from the previously approved **TFE Studios Three.js Website v3.1**. The visible red/orange emblem and white italic header wordmark are the original supplied assets, not replacements. Page motion, scroll reactions, filters, process controls and `#` routing are retained from the prototype. A WebGL motion logo is shown when Three.js loads; an accessible animated-logo fallback is always present.

## Installation on a staging WordPress site

1. Back up your existing site and database. Use **staging**, not your live site.
2. In the dashboard go to **Appearance → Themes → Add New → Upload Theme**.
3. Upload the separately provided `TFE-Studios-WordPress-Theme-v0.1.zip` (the ZIP must contain the `tfe-studios-motion/` directory).
4. Activate the theme only on staging. Visit the site's homepage.
5. Manage mission, vision and contacts in **Appearance → Customize → TFE Studios — Company Content**.
6. Use **TFE Services** / **TFE Portfolio** in the WordPress admin. Posts will replace the corresponding prototype fallback display in each section once any are published.
7. Test each of the six hash routes and navigation on mobile before considering a live deployment.

## Hash routes

- `/#home` — hero/3D logo
- `/#about` — mission, vision and values
- `/#services` — WordPress-editable service taxonomy/display
- `/#portfolio` — WordPress-editable project cards
- `/#process` — five-stage lifecycle
- `/#contact` — verified director contact details and general enquiries

Hash routes offer immersive navigation, but **search engines generally treat them as a single URL** rather than six separately indexable pages. For search performance, use separate canonical WordPress pages or server-rendered routes in a future release while preserving animated transitions.

## Current limitations and acceptance work for Codex

- **Three.js** is currently pinned to version 0.161.0 from jsDelivr at runtime. **Codex should bundle it locally** for resilience and content security policy compatibility. The site still displays the original logo with CSS motion if the CDN or WebGL is unavailable.
- Contact form opens a user's email app with a prefilled message; it **does not deliver to the server**. Do not describe it as a submitted enquiry. Replace it only with a secure WordPress/SMTP workflow, approved and tested with rate-limiting/spam protection.
- Starter Customizer supports mission, vision, intro and contacts; projects and services are editable through admin custom post types.
- No specific customer results are invented. Portfolio capabilities are identified as concepts, not verified client work.
- Branding and contact data should be reviewed before launch.
- No design builder or external proprietary plugin is required to render the theme.

## Security & architecture

Core WordPress API; `wp_enqueue_scripts`, `wp_head`, `wp_footer`, nonces and capability checks for custom metadata, output escaped for its context. No direct database writes or credential files. Private project data should not be included in published portfolio posts.

## Recommended workflow

Create a **new** GitHub repository `TFE35/tfe-studios-wordpress`; do not put this into `TFE35/pocketwise-android`. Commit the ZIP contents to that repository, review `CODEX_TASK.md`, and ask Codex to implement through a feature branch and pull request. Confirm build/test results before deployment.

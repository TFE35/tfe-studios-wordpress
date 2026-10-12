# Staging, verification and rollback

Do not install this candidate on www.tfestudios.com during development: the user confirmed it is live production.

1. Create an isolated staging clone on the hosting provider. Protect it with authentication and discourage indexing. Back up its files, database, active theme, plugins and configuration.
2. Save the currently verified active theme ZIP and record WordPress/PHP/plugin versions and its configuration. Keep this backup as the real rollback; there is no supplied verified production release of TFE Motion.
3. Build with Node 22+, `pnpm install --frozen-lockfile`, `pnpm run lint`, `pnpm run test`, `pnpm run build`. Package the single `tfe-studios-motion` directory under wp-content/themes, including js/vendor. Upload that ZIP in Appearance → Themes → Add New. Activate only on staging.
4. Set the staging homepage to render the theme front-page template. Review Settings → Reading and the six direct /# routes. Hash routes remain one indexable document. Separate canonical pages are a future proposal requiring approval.
5. Edit company content in TFE Content. Authorized editors need edit_pages; administrators manage delivery. Services/Portfolio use native post editing, Featured Image/Excerpt and Order in Page Attributes. Zero published posts retains labelled prototype content/default capabilities. One or multiple posts replace that section's defaults. Metadata links must be public and verified claims must have evidence.
6. Configure authenticated SMTP using the hosting provider or a maintained mail plugin; credentials belong in provider configuration or secrets, never Git/theme files. Set an authenticated sender; visitors appear only in Reply-To. Check SPF/DKIM/DMARC with the mail administrator.
7. Publish a site privacy policy reflecting real retention and mail handling. The theme emails enquiry data; it does not store message bodies. It stores salted rate-limit keys for one hour and request hashes for up to one day, cleared by WP-Cron. Ensure WP-Cron runs reliably. Hosting/email logs may retain data under their own policies.
8. Enable enquiries in TFE Content only after review. Test valid/invalid/expired nonce, honeypot, consent, malformed inputs, five-per-hour IP limit, global rate cap, duplicate id, mail rejection and actual receipt/reply. wp_mail success means the mail service accepted the message, not confirmed inbox delivery. Keep the direct email link.
9. Test all routes and interactions at 360/390/768/1440px, touch/keyboard, Back/Forward, reduced motion, no WebGL, context loss/restoration, hidden tabs, failed images, no JavaScript and logged-in toolbar. Review browser and PHP logs.
10. Test the actual staging plugins and caching/minification stack. Exclude /wp-json/tfe/v1/token and enquiry POST from all caches. Preserve local dynamic module loading. CSP needs script-src 'self', connect-src 'self', img-src 'self' data:, and style support for existing WordPress/theme styles and dynamic visual transforms. Test nonce/hashes with the host; the theme does not install a CSP header. No guarantee for policies forbidding all style attributes.
11. Obtain approval of the reviewed PR, staging evidence, content, privacy and actual email delivery before any production installation or DNS/hosting changes.

## Rollback
Back up before changing themes. On staging, activate the previous verified theme or upload its saved ZIP, restore compatible theme settings/database if required, purge caches, and verify routes/content/contact. Custom posts remain in the database but this theme's UI is registered by the theme. Test rollback in staging before production. The included original v0.1.0 ZIP passed a local development restore smoke test and is preserved for comparison and development recovery; its CDN/mailto limitations make it unsuitable as an asserted verified production rollback.

## Direct enquiries and attachments
See [ATTACHMENTS.md](ATTACHMENTS.md) before enabling document uploads. Plain enquiries require an approved privacy policy and authenticated SMTP; enable them in TFE Content. Version 0.5.0 supports attachments without antivirus scanning at the user's request. Verify private temporary storage, cleanup and actual attachment receipt before enabling uploads; an SMTP test alone does not establish these checks.


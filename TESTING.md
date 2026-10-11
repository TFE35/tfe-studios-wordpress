# Verification record — 0.2.0

Test date: 11 October 2026. This is a staging candidate, not production approved.

## Passed locally
- Build: esbuild 0.25.12 with locked Three.js 0.161.0; module imports and reports revision 161.
- Node 24.19.0 syntax checks and two source-integrity/module tests.
- PHP 8.3.30 WebAssembly parser: all seven active theme PHP files pass TOKEN_PARSE syntax validation.
- Enquiry handler executed in PHP 8.3.30 with mocked WordPress APIs: disabled delivery, malformed scalar inputs, invalid nonce, honeypot, missing consent, unsupported service, email header injection, valid acceptance, duplicate dispatch prevention, mail failure and rate rejection pass. No external mail sent. These tests do not replace actual WordPress/SMTP verification.
- Microsoft Edge headless frontend fixture at 360/390/768/1440px: direct #services, two digital service results, process selection, Back navigation, no document horizontal overflow and no uncaught JavaScript errors.
- At 390px: mobile menu opens/closes with Escape; invalid form fields expose errors; simulated delivery failure preserves message; simulated acceptance clears it.
- JavaScript disabled: Services remains visible. Normal motion: local WebGL logo loads without an uncaught page error.
- Active-theme premium static audit: zero findings. Archived prototype is excluded because it is intentionally unchanged. The static auditor does not parse PHP templates and is not accessibility certification.
- Official emblem and original navigation wordmark hashes match the supplied reference.

Screenshots and JSON results are under evidence/frontend. These are frontend fixture evidence, not WordPress staging screenshots.

## Pending / limitations
- Managed WordPress staging, actual hosting plugins, SMTP inbox delivery and replies, privacy policy approval, caching/minification/CSP deployment and backend editing/update flows remain release gates.
- Local WordPress Playground 3.1.26, WordPress 6.8, PHP 8.3.30 and SQLite successfully rendered the active theme with six workers. Direct hash/filter/process/Back behavior, form validation, disabled server delivery (503), uncached token route (200), JavaScript-disabled sections and local WebGL/context-loss fallback passed at 360/390/768/1440px. Evidence is under evidence/wordpress.
- Initial one-worker requests timed out; six workers resolved it. Playground reports native file unlock warnings in this Windows environment. These tooling warnings and managed-host differences remain limitations.
- PHP Coding Standards tooling was not installed; existing starter formatting has not been represented as WPCS compliant.
- Full WCAG 2.2 AA audit, physical touch devices, editor-role delegation, GPU context restoration, hidden-tab profiling and complete offline tests remain unverified. Logged-in toolbar screenshots, a no-WebGL simulation and context-loss event fallback were checked locally.
- No verified previous TFE Motion production release was supplied. v0.1.0 is archived as an unverified development baseline, not a verified production rollback.

Frontend harness: `node tests/frontend-fixture.cjs` with Playwright installed and Microsoft Edge available. Set TFE_PLAYWRIGHT_MODULE to the installed Playwright module path if it is not a local dependency. This optional harness is separate from the two tests run by pnpm test.

Local WordPress administrator content save and frontend round-trip passed; original intro was restored. Logged-in toolbar and content-panel screenshots are included. Editor-role delegation and managed-host backend flows remain to be confirmed.

Native WordPress content tests also passed for one/multiple Services and Portfolio entries, menu_order sorting and unverified-project labels. The zero-item fallback was checked by the initial runtime tests. Local test posts were removed afterward.

No-WebGL simulation on the real local WordPress page at 390px passed: fallback original logo remains visible and no uncaught page errors were observed.

Local development rollback smoke test passed: copied the archived v0.1.0 files into the isolated active theme, verified Services, restored the full v0.2.0 snapshot and verified its configuration and Services. This does not qualify v0.1.0 for production; its known CDN, mailto and no-JavaScript limitations remain.

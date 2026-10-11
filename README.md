# TFE Studios WordPress

Native theme v0.2.0 **staging candidate**, based on supplied v3.1. No production deployment is authorized. Company documents are excluded from this public repository.

- Theme: wp-content/themes/tfe-studios-motion
- Immutable reference: reference/v3.1/index.html
- Supplied starter: reference/starter-v0.1.0
- Build: Node 24 (tested), `pnpm install --frozen-lockfile && pnpm run build`
- Checks: `pnpm run lint`, `pnpm run test`; PHP syntax must also pass.
- Content: TFE Content panel, Services and Portfolio. SMTP credentials never belong in source.
- Hash URLs are preserved and share one canonical document; separate canonical URLs need approval.

See DEPLOYMENT.md for staging, delivery configuration, verification and rollback. See TESTING.md for actual evidence and limitations. Original brand image exports are retained; company PDFs are not website content.

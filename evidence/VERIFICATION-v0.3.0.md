# TFE Motion 0.3.0 — mobile refinement

11 October 2026. Candidate only; no production or staging installation performed by the agent.

- Fixed the static-homepage body collision: theme route selectors use section.page, so WordPress's body.page stays visible. This corrects a case missed in 0.2.0's posts-front-page tests; 0.2.1 was installed by the user and confirmed displaying.
- Solid DIFFERENT. lettering, adjusted mobile spacing, dedicated centered logo region with touch dragging and keyboard tilt.
- The Studio labels retain #about links; white section keeps the supplied artwork and red/gold/black identity.
- Destination-labelled horizontal transitions, forward/backward direction, touch page swipes that exclude interactive controls and the logo.
- Equal-width mobile service categories; selected mobile process detail moves beneath its stage, with selected control scrolled into view. Desktop panel stays beside the stage list.

## Validation

Frozen-lockfile pnpm install, lint, two integrity/module tests and local Three.js build passed (Node 24, pnpm 11.25). Seven PHP files pass PHP 8.3.30 syntax parsing.

Expanded Playwright frontend fixture passed at 360/390/768/1440: static WordPress-style body.page visibility, Studio background and document overflow, inline process placement for all five stages, filter/form/navigation regressions, solid headline and no-JavaScript sections. Chromium touch input verified both swipe directions, destination curtain labels and 3D tilt without page navigation. Keyboard arrows tilt the logo. No uncaught browser errors.

Evidence uses the supplied reference markup with current process/form/CSS/JS and WordPress body classes. It is not execution of the new PHP on DreamHost. Screenshots are local fixture evidence, not a claim of staging deployment. Physical phone review after the user installs this ZIP remains necessary. Authenticated SMTP, privacy and production approval remain pending.

Both live and staging were clarified by the user to be fresh WordPress installations. No existing production TFE release exists to call a verified rollback. Preserve full files/database/default-theme backups before production changes.

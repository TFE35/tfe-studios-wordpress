# 0.3.1 mobile logo composition

11 October 2026. User requested headline beside the logo with slight foreground
overlap, while retaining the desktop animation.

Mobile uses the original artwork in a dedicated Three.js camera profile, gentle
idle movement, and a 1.5-second tap-to-tilt response. Enter/Space provides the same
action. Desktop pointer tracking, camera position and motion formulas are retained.
Mobile vertical scrolling remains native; page swipes exclude the logo stage.
Reduced motion and no-WebGL use the original static fallback.

Validation: lint, two source-integrity/module tests and bundle build passed.
Expanded frontend fixture passed at 360/390/768/1440 with no uncaught errors,
no document overflow, static homepage body visibility, existing navigation,
services/form/process checks and no-JavaScript sections. Chromium touch input
confirmed tap response and both page swipe directions; keyboard activation and
desktop mouse tilt passed. Local Three.js preview is mobile-three-390.png.

This is local browser fixture evidence, not a DreamHost installation. Physical
phone review after uploading the candidate remains pending. No live site changes.

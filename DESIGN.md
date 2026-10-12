---
version: alpha
name: TFE Studios Motion
description: Approved v3.1 cinematic creative studio identity, preserved in a native WordPress theme.
colors:
  background: '#111316'
  surface: '#222428'
  text: '#f6f4ef'
  primary: '#DA121B'
  secondary: '#DA7F27'
  focus: '#E3A13C'
typography:
  display:
    fontFamily: "'Space Grotesk', 'Arial Black', Arial, sans-serif"
  body:
    fontFamily: "'DM Sans', Arial, sans-serif"
rounded:
  header: '12px'
spacing:
  maximum: '1440px'
  mobileMargin: '19px'
components:
  navigation: {}
  enquiry: {}
---

## Overview
Brand site for TFE Studios, an Eswatini creative studio serving brands, creators and communities. English content, phone and desktop use. The job is to explain capabilities and invite enquiries. The supplied v3.1 reference defines the composition; conversion does not authorize a redesign. The signature is the original full-colour floating emblem behind kinetic headlines. Company PDFs remain outside the public repository.

## Colors
`wp-content/themes/tfe-studios-motion/style.css` is the canonical runtime token source. This document mirrors its existing :root tokens: background --bg, surface --pane, text --white, primary --red, secondary --orange and focus --gold. Keep original bitmap colours untouched. Gold focus rings and explicit text accompany states. Forced colours use system highlights.

## Typography
Preserve the prototype's display/body stacks with local Arial fallbacks. No remote font calls. Space Grotesk and DM Sans font files were not supplied; current rendering uses available fallbacks. Lato in the supplied manual is proposed and does not override this experience. Original wordmarks are images, never typeset substitutes.

## Layout
Six hash sections, one active with JavaScript and all available without it. Retain original responsive breakpoints 1240/950/620/380px and supplied editorial grid. Images preserve aspect ratio; portfolio media uses a stable frame. Navigation accommodates the WordPress admin toolbar. Contact controls and feedback stay in the same layout while sending.

## Elevation & Depth
Dark surfaces, subtle borders and original hero depth remain. No added brand artwork or fabricated client work. Portfolio prototype examples are labelled placeholders.

## Shapes
Preserve floating header and circular route controls. Keep keyboard focus distinct from decorative rings.

## Components
Native anchors for navigation and buttons for actions. Mobile navigation wraps keyboard focus, closes on Escape and restores focus. Enquiry errors remain next to fields; status is announced; repeated submissions are blocked while pending. Native service select intentionally uses the operating system popup. SMTP remains external to theme code.

## Motion
Preserve curtain/swipe/process/filter interactions. Respect reduced motion. Pause WebGL frame scheduling outside Home and while hidden; fall back to the supplied logo if the local bundle or WebGL fails.


## Approved mobile refinement — 0.3.0
The user requested The Studio navigation label and a white Studio section. Runtime
--studio-bg mirrors --white (#f6f4ef); --studio-ink mirrors --bg (#111316).
Original artwork, red/gold accents and image wordmarks remain unchanged. The Studio
keeps a dark floating navigation shell for white-wordmark contrast. DIFFERENT. uses
solid text and normal spacing instead of overlapping outline glyphs. On phones the
original logo has a dedicated, centered touch area after the introduction. Page
transitions name their destination and sweep horizontally in navigation direction.
Mobile service filters use a full-width All row and equal two-column categories.
One shared process detail panel sits immediately after the chosen stage on phones,
and returns to the desktop side-by-side layout at larger widths. #about URLs remain
compatible. Reduced motion bypasses transition motion and retains static artwork.

### Mobile hero refinement — 0.3.1
The user requested the mobile headline beside the logo with a small overlap. At
620px and below the headline occupies the left foreground and the centered emblem
occupies the right. The introduction stays underneath. Mobile Three.js uses a
separate camera and subtle idle motion; tap or Enter/Space gives a short yaw and
returns to its front view. Horizontal drags in that stage do not navigate pages.
Desktop camera, pointer tracking and animation formulas stay unchanged. Static
fallback artwork is preserved for reduced motion and unavailable WebGL.

## Contact documents
Optional native multiple-file picker follows the contact form styles. Inline type/size errors retain visitor input; a live status reports scanning/sending, rejection or mail acceptance. Attachments disabled until configured; the explicit email link remains available. No automatic mail app navigation.

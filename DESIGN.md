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

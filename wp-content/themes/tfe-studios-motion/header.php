<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#111316">
<?php if (!has_site_icon()) : ?><link rel="icon" type="image/png" href="<?php echo esc_url(get_theme_file_uri('assets/TFE-Studios-Official-Logo.png')); ?>"><?php endif; ?>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#<?php echo is_front_page() ? 'pages' : 'content'; ?>">Skip to content</a>
<div class="grain" aria-hidden="true"></div>
<div id="cursorHalo" aria-hidden="true"></div>
<div id="pageCurtain" class="page-curtain" aria-hidden="true"><span class="curtain-mark">TFE<span class="orange">/</span>STUDIOS</span><span class="curtain-num" id="curtainNum">01 / 06</span></div>
<div class="global-progress" aria-hidden="true"><div id="pageProgress"></div></div>
<header class="site-header" id="siteHeader">
  <a class="brand-lockup" href="<?php echo esc_url(is_front_page() ? "#home" : home_url("/#home")); ?>" aria-label="TFE Studios home"><img src="<?php echo esc_url(get_theme_file_uri('assets/TFE-Studios-White-Header-Wordmark.png')); ?>" alt="TFE STUDIOS" width="2010" height="295"></a>
  <nav class="desktop-nav" aria-label="Main navigation">
    <a href="<?php echo esc_url(is_front_page() ? "#home" : home_url("/#home")); ?>" data-nav="home">HOME</a><a href="<?php echo esc_url(is_front_page() ? "#about" : home_url("/#about")); ?>" data-nav="about">ABOUT</a><a href="<?php echo esc_url(is_front_page() ? "#services" : home_url("/#services")); ?>" data-nav="services">SERVICES</a><a href="<?php echo esc_url(is_front_page() ? "#portfolio" : home_url("/#portfolio")); ?>" data-nav="portfolio">WORK</a><a href="<?php echo esc_url(is_front_page() ? "#process" : home_url("/#process")); ?>" data-nav="process">PROCESS</a>
  </nav>
  <a class="header-contact" href="<?php echo esc_url(is_front_page() ? "#contact" : home_url("/#contact")); ?>">LET'S TALK <span>↗</span></a>
  <button aria-controls="mobileMenu" id="menuToggle" class="menu-toggle" aria-label="Open navigation menu" aria-expanded="false"><span></span><span></span></button>
</header>
<nav id="mobileMenu" class="mobile-menu" aria-label="Mobile navigation"><a href="<?php echo esc_url(is_front_page() ? "#home" : home_url("/#home")); ?>">Home <span>01</span></a><a href="<?php echo esc_url(is_front_page() ? "#about" : home_url("/#about")); ?>">About <span>02</span></a><a href="<?php echo esc_url(is_front_page() ? "#services" : home_url("/#services")); ?>">Services <span>03</span></a><a href="<?php echo esc_url(is_front_page() ? "#portfolio" : home_url("/#portfolio")); ?>">Work <span>04</span></a><a href="<?php echo esc_url(is_front_page() ? "#process" : home_url("/#process")); ?>">Process <span>05</span></a><a href="<?php echo esc_url(is_front_page() ? "#contact" : home_url("/#contact")); ?>">Contact <span>06</span></a></nav>
<div class="page-index" aria-hidden="true"><span id="indexCurrent">01</span><span class="index-line"></span><span>06</span></div>
<div class="social-rail"><span>FOLLOW THE IDEAS</span><a href="mailto:info@tfestudios.com" aria-label="Email TFE Studios">↗</a></div>

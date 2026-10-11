<?php
/**
 * TFE Studios Motion — a purpose-built classic WordPress theme.
 * @package TFE_Studios_Motion
 */
if (!defined('ABSPATH')) { exit; }

define('TFE_THEME_VERSION', '0.3.0');

function tfe_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_image_size('tfe-portfolio', 1440, 1000, true);
    add_theme_support('custom-logo');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
    add_theme_support('responsive-embeds');
    add_theme_support('editor-styles');
    register_nav_menus(array('primary' => __('Main navigation', 'tfe-studios-motion')));
}
add_action('after_setup_theme', 'tfe_theme_setup');

function tfe_enqueue_assets() {
    wp_enqueue_style('tfe-motion', get_stylesheet_uri(), array(), TFE_THEME_VERSION);
    if (is_front_page()) {
        wp_enqueue_script('tfe-app', get_theme_file_uri('js/app.js'), array(), TFE_THEME_VERSION, true);
        wp_enqueue_script('tfe-contact', get_theme_file_uri('js/contact.js'), array('tfe-app'), TFE_THEME_VERSION, true);
    }
}
add_action('wp_enqueue_scripts', 'tfe_enqueue_assets');

function tfe_defaults() {
    return array(
        'hero_line_one' => 'WE MAKE',
        'hero_line_two' => 'IDEAS',
        'hero_accent' => 'HIT.',
        'hero_line_three' => 'DIFFERENT.',
        'home_intro' => 'We push creative boundaries, deliver impactful storytelling and shape what culture feels like next.',
        'mission' => 'To push creative boundaries, deliver impactful storytelling, and shape cultural narratives through media, design and experiential strategies. Every idea should connect deeply—and leave something meaningful behind.',
        'vision' => 'To become a globally recognized creative powerhouse, seamlessly bringing together strategy, innovation and execution to transform ideas into unforgettable brand experiences.',
        'director_name' => 'Sibonelo Mkhombe',
        'director_phone' => '+268 7940 7962',
        'director_email' => 'sibonelo.mkhombe@tfestudios.com',
        'general_email' => 'info@tfestudios.com',
    );
}
function tfe_setting($key) {
    $defaults = tfe_defaults();
    return get_theme_mod($key, isset($defaults[$key]) ? $defaults[$key] : '');
}

function tfe_customizer($wp_customize) {
    $wp_customize->add_section('tfe_company', array(
        'title' => __('TFE Studios — Company Content', 'tfe-studios-motion'),
        'priority' => 31,
        'description' => __('Edit the company mission, vision and contact information displayed on the hash-page website.', 'tfe-studios-motion'),
    ));
    foreach (tfe_defaults() as $key => $default) {
        $is_email = substr($key, -6) === '_email';
        $is_long = in_array($key, array('mission', 'vision', 'home_intro'), true);
        $wp_customize->add_setting($key, array(
            'default' => $default,
            'sanitize_callback' => $is_email ? 'sanitize_email' : 'sanitize_text_field',
            'transport' => 'refresh',
        ));
        $wp_customize->add_control($key, array(
            'label' => ucwords(str_replace('_', ' ', $key)),
            'section' => 'tfe_company',
            'type' => $is_long ? 'textarea' : 'text',
            'input_attrs' => array('autocomplete' => 'off'),
        ));
    }
}
add_action('customize_register', 'tfe_customizer');

function tfe_default_services() {
    return array(
        array('GRAPHIC DESIGN', 'brand'),
        array('DIGITAL MARKETING', 'digital'),
        array('BRAND DEVELOPMENT', 'brand'),
        array('CONTENT CREATION', 'production'),
        array('WEB & DIGITAL EXPERIENCES', 'digital'),
        array('PHOTOGRAPHY', 'production'),
        array('VIDEO PRODUCTION', 'production'),
        array('RESEARCH & STRATEGY', 'strategy'),
        array('PUBLIC RELATIONS', 'strategy'),
        array('CREATIVE CONSULTING', 'strategy'),
    );
}
function tfe_service_count() {
    $posts = get_posts(array('post_type' => 'tfe_service', 'post_status' => 'publish', 'numberposts' => -1, 'fields' => 'ids'));
    return $posts ? count($posts) : count(tfe_default_services());
}

function tfe_register_content_types() {
    register_post_type('tfe_service', array(
        'labels' => array('name' => __('TFE Services', 'tfe-studios-motion'), 'singular_name' => __('TFE Service', 'tfe-studios-motion')),
        'public' => false, 'show_ui' => true, 'show_in_rest' => true, 'menu_icon' => 'dashicons-art',
        'supports' => array('title', 'editor', 'page-attributes'),
        'rewrite' => false,
    ));
    register_post_type('tfe_project', array(
        'labels' => array('name' => __('TFE Portfolio', 'tfe-studios-motion'), 'singular_name' => __('TFE Project', 'tfe-studios-motion')),
        'public' => false, 'show_ui' => true, 'show_in_rest' => true, 'menu_icon' => 'dashicons-portfolio',
        'supports' => array('title', 'editor', 'excerpt', 'thumbnail', 'page-attributes'),
        'rewrite' => false,
    ));
}
add_action('init', 'tfe_register_content_types');

function tfe_meta_boxes() {
    add_meta_box('tfe_service_type', __('Service Category', 'tfe-studios-motion'), 'tfe_service_box', 'tfe_service', 'side');
    add_meta_box('tfe_project_options', __('Portfolio Display & Link', 'tfe-studios-motion'), 'tfe_project_box', 'tfe_project', 'normal');
}
add_action('add_meta_boxes', 'tfe_meta_boxes');

function tfe_service_box($post) {
    wp_nonce_field('tfe_service_save', 'tfe_service_nonce');
    $category = get_post_meta($post->ID, '_tfe_category', true) ?: 'brand';
    echo '<label for="tfe_service_category">Category</label><br><select id="tfe_service_category" name="tfe_service_category">';
    foreach (array('brand', 'digital', 'production', 'strategy') as $value) {
        printf('<option value="%s" %s>%s</option>', esc_attr($value), selected($category, $value, false), esc_html(ucfirst($value)));
    }
    echo '</select><p class="description">Use Order in Page Attributes to arrange cards.</p>';
}
function tfe_project_box($post) {
    wp_nonce_field('tfe_project_save', 'tfe_project_nonce');
    $url = get_post_meta($post->ID, '_tfe_project_url', true);
    $label = get_post_meta($post->ID, '_tfe_project_label', true);
    $verified = get_post_meta($post->ID, '_tfe_verified', true) === '1';
    echo '<p><label for="tfe_project_url">Public project link (optional)</label><br><input id="tfe_project_url" name="tfe_project_url" type="url" style="width:100%" value="' . esc_attr($url) . '"></p>';
    echo '<p><label for="tfe_project_label">Short category/label</label><br><input id="tfe_project_label" name="tfe_project_label" type="text" style="width:100%" maxlength="75" value="' . esc_attr($label) . '"></p>';
    echo '<p><label><input type="checkbox" name="tfe_project_verified" value="1" ' . checked($verified, true, false) . '> This is a verified completed TFE Studios project authorized for public display</label></p>';
    echo '<p class="description">Add a Featured Image and Excerpt for a full visual card. Unverified entries are labelled as capability showcases; do not present hypothetical work as real clients.</p>';
}
function tfe_save_meta($post_id) {
    if (wp_is_post_revision($post_id) || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || !current_user_can('edit_post', $post_id)) { return; }
    $type = get_post_type($post_id);
    if ($type === 'tfe_service' && isset($_POST['tfe_service_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['tfe_service_nonce'])), 'tfe_service_save')) {
        $value = isset($_POST['tfe_service_category']) ? sanitize_key(wp_unslash($_POST['tfe_service_category'])) : 'brand';
        update_post_meta($post_id, '_tfe_category', in_array($value, array('brand', 'digital', 'production', 'strategy'), true) ? $value : 'brand');
    }
    if ($type === 'tfe_project' && isset($_POST['tfe_project_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['tfe_project_nonce'])), 'tfe_project_save')) {
        $url = isset($_POST['tfe_project_url']) ? esc_url_raw(wp_unslash($_POST['tfe_project_url'])) : '';
        $label = isset($_POST['tfe_project_label']) ? sanitize_text_field(wp_unslash($_POST['tfe_project_label'])) : '';
        update_post_meta($post_id, '_tfe_project_url', $url);
        update_post_meta($post_id, '_tfe_project_label', $label);
        update_post_meta($post_id, '_tfe_verified', isset($_POST['tfe_project_verified']) ? '1' : '0');
    }
}
add_action('save_post', 'tfe_save_meta');

require_once get_theme_file_path( 'inc/enquiries.php' );
require_once get_theme_file_path( 'inc/editor.php' );

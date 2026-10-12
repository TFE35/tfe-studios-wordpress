<?php
/** Narrow content controls for authorized editors; no role changes. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
add_action( 'admin_menu', function () {
    add_menu_page( 'TFE Company Content', 'TFE Content', 'edit_pages', 'tfe-content', 'tfe_content_page', 'dashicons-art', 25 );
} );
function tfe_content_page() {
    if ( ! current_user_can( 'edit_pages' ) ) { return; }
    if ( isset( $_POST['tfe_content_nonce'] ) ) {
        check_admin_referer( 'tfe_content', 'tfe_content_nonce' );
        foreach ( tfe_defaults() as $key => $default ) {
            if ( isset( $_POST[ $key ] ) && is_string( $_POST[ $key ] ) ) {
                $value = wp_unslash( $_POST[ $key ] );
                $limit = strpos( $key, 'hero_' ) === 0 ? 40 : 2500;
                set_theme_mod( $key, substr( substr( $key, -6 ) === '_email' ? sanitize_email( $value ) : sanitize_textarea_field( $value ), 0, $limit ) );
            }
        }
        if ( current_user_can( 'manage_options' ) ) {
            set_theme_mod( 'tfe_enquiries_enabled', isset( $_POST['tfe_enquiries_enabled'] ) && (bool) get_privacy_policy_url() );
            set_theme_mod( 'tfe_attachments_enabled', isset( $_POST['tfe_attachments_enabled'] ) && (bool) tfe_attachment_ready() && (bool) get_privacy_policy_url() );
        }
        echo '<div class="notice notice-success"><p>Content saved.</p></div>';
    }
    echo '<div class="wrap"><h1>TFE Company Content</h1><form method="post">';
    wp_nonce_field( 'tfe_content', 'tfe_content_nonce' );
    foreach ( tfe_defaults() as $key => $default ) {
        echo '<p><label for="' . esc_attr( $key ) . '"><strong>' . esc_html( ucwords( str_replace( '_', ' ', $key ) ) ) . '</strong></label><br><textarea class="large-text" rows="3" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '">' . esc_textarea( tfe_setting( $key ) ) . '</textarea></p>';
    }
    if ( current_user_can( 'manage_options' ) ) {
        echo '<p><label><input type="checkbox" name="tfe_enquiries_enabled" value="1" ' . checked( get_theme_mod( 'tfe_enquiries_enabled', false ), true, false ) . '> Enable server enquiries after SMTP and privacy policy verification</label></p><p>Configure authenticated SMTP in your hosting service or a maintained mail plugin. Never put credentials in the theme. Publish a privacy policy before enabling delivery.</p>';
        echo '<p><label><input type="checkbox" name="tfe_attachments_enabled" value="1" ' . checked( get_theme_mod( 'tfe_attachments_enabled', false ), true, false ) . ' ' . disabled( (bool) tfe_attachment_ready(), false, false ) . '> Enable document uploads without virus scanning</label></p><p>Attachments are not virus-scanned. Type, size and DOCX structure checks do not prove files are safe. Files are emailed through WP Mail SMTP, then deleted from private temporary storage outside the current web root. Verify hosting storage, cleanup and actual attachment receipt before enabling. Publish the enquiry privacy policy first.</p>';
    }
    submit_button( 'Save TFE content' );
    echo '</form></div>';
}

<?php
/** Protected enquiry delivery. Credentials are configured outside this theme. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function tfe_enquiry_routes() {
    register_rest_route( 'tfe/v1', '/token', array(
        'methods' => 'GET', 'permission_callback' => '__return_true',
        'callback' => function () {
            $response = new WP_REST_Response( array( 'nonce' => wp_create_nonce( 'tfe_enquiry' ) ) );
            $response->header( 'Cache-Control', 'no-store, private, max-age=0' );
            return $response;
        },
    ) );
    register_rest_route( 'tfe/v1', '/enquiry', array(
        'methods' => 'POST', 'permission_callback' => '__return_true',
        'callback' => 'tfe_receive_enquiry',
    ) );
}
add_action( 'rest_api_init', 'tfe_enquiry_routes' );

function tfe_receive_enquiry( $request ) {
    if ( ! get_theme_mod( 'tfe_enquiries_enabled', false ) || ! get_privacy_policy_url() ) {
        return new WP_Error( 'disabled', 'Please use the email link to contact us.', array( 'status' => 503 ) );
    }
    $multipart = stripos( (string) $request->get_header( 'content-type' ), 'multipart/form-data' ) === 0;
    $data = $multipart ? $request->get_body_params() : $request->get_json_params();
    if ( ! is_array( $data ) || ( ! $multipart && strlen( $request->get_body() ) > 16000 ) || ( $multipart && isset( $_SERVER['CONTENT_LENGTH'] ) && (int) $_SERVER['CONTENT_LENGTH'] > 9 * 1024 * 1024 ) ) {
        return new WP_Error( 'invalid', 'The enquiry is too large or invalid.', array( 'status' => 400 ) );
    }
    foreach ( array( 'nonce', 'name', 'email', 'service', 'message', 'website', 'consent', 'request_id' ) as $key ) {
        if ( ! isset( $data[ $key ] ) || ! is_string( $data[ $key ] ) ) {
            return new WP_Error( 'invalid', 'Please complete the enquiry form.', array( 'status' => 400 ) );
        }
    }
    $text_bytes = 0;
    foreach ( $data as $value ) { if ( ! is_string( $value ) ) { return new WP_Error( 'invalid', 'Invalid enquiry fields.', array( 'status' => 400 ) ); } $text_bytes += strlen( $value ); }
    if ( $text_bytes > 16000 ) { return new WP_Error( 'invalid', 'The enquiry is too large.', array( 'status' => 400 ) ); }
    $entries = tfe_upload_entries( $request->get_file_params() );
    if ( is_wp_error( $entries ) ) { return $entries; }
    if ( ! wp_verify_nonce( $data['nonce'], 'tfe_enquiry' ) ) {
        return new WP_Error( 'expired', 'Please refresh the page and try again.', array( 'status' => 403 ) );
    }
    if ( '' !== $data['website'] ) {
        return new WP_Error( 'invalid', 'The enquiry could not be accepted. Please use email.', array( 'status' => 400 ) );
    }
    $services = array( 'Brand & identity', 'Digital & web', 'Content & production', 'Strategy & marketing', 'Something else entirely' );
    $email = sanitize_email( $data['email'] );
    $name = sanitize_text_field( $data['name'] );
    $message = sanitize_textarea_field( $data['message'] );
    if ( ! is_email( $data['email'] ) || ! is_email( $email ) || preg_match( '/[\r\n]/', $data['email'] ) || strlen( $email ) > 254 || '' === $name || strlen( $name ) > 120 || '' === $message || strlen( $message ) > 10000 || ! in_array( $data['service'], $services, true ) || 'yes' !== $data['consent'] || ! preg_match( '/^[a-f0-9-]{36}$/i', $data['request_id'] ) ) {
        return new WP_Error( 'invalid', 'Check your name, email, message and consent.', array( 'status' => 400 ) );
    }
    $recipient = sanitize_email( tfe_setting( 'general_email' ) );
    if ( ! is_email( $recipient ) ) {
        return new WP_Error( 'config', 'Please use the director email link.', array( 'status' => 503 ) );
    }
    // Trust the server address only, never visitor-supplied forwarding headers.
    $ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
    $fingerprint = hash_hmac( 'sha256', $ip, wp_salt( 'auth' ) );
    $key = 'tfe_rate_' . substr( $fingerprint, 0, 32 );
    // Serialize rate reservation across PHP workers using WordPress's unique option key.
    if ( ! add_option( 'tfe_enquiry_rate_lock', time(), '', false ) ) {
        $lock_time = (int) get_option( 'tfe_enquiry_rate_lock' );
        if ( $lock_time && time() - $lock_time > 60 ) { delete_option( 'tfe_enquiry_rate_lock' ); }
        return new WP_Error( 'busy', 'Please try again shortly or use email.', array( 'status' => 429 ) );
    }
    $count = (int) get_transient( $key );
    if ( $count >= 5 || (int) get_transient( 'tfe_global_mail_rate' ) >= 50 ) {
        delete_option( 'tfe_enquiry_rate_lock' );
        return new WP_Error( 'rate', 'Too many enquiries. Please try later or email us.', array( 'status' => 429 ) );
    }
    // Reserve a request atomically before dispatch; do not resend an uncertain attempt.
    $lock = 'tfe_request_' . hash( 'sha256', $fingerprint . $data['request_id'] );
    if ( ! add_option( $lock, time(), '', false ) ) {
        delete_option( 'tfe_enquiry_rate_lock' );
        return new WP_Error( 'duplicate', 'This enquiry was already attempted. Please use email if unsure.', array( 'status' => 409 ) );
    }
    wp_schedule_single_event( time() + DAY_IN_SECONDS, 'tfe_clear_enquiry_lock', array( $lock ) );
    set_transient( $key, $count + 1, HOUR_IN_SECONDS );
    set_transient( 'tfe_global_mail_rate', (int) get_transient( 'tfe_global_mail_rate' ) + 1, HOUR_IN_SECONDS );
    delete_option( 'tfe_enquiry_rate_lock' );
    $body = "Name: {$name}\nReply email: {$email}\nArea: {$data['service']}\nConsent: visitor agreed to enquiry processing.\n\n{$message}";
    $documents = tfe_prepare_documents( $entries );
    if ( is_wp_error( $documents ) ) { delete_option( $lock ); return $documents; }
    try {
        $sent = wp_mail( $recipient, 'TFE Studios website enquiry', $body, array( 'Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $email ), $documents );
    } catch ( Throwable $error ) {
        $sent = false;
    } finally {
        tfe_delete_documents( $documents );
    }
    if ( ! $sent ) {
        return new WP_Error( 'mail', 'The mail service could not accept your enquiry. Please use email.', array( 'status' => 502 ) );
    }
    $response = new WP_REST_Response( array( 'message' => 'The mail service accepted your enquiry. If you do not hear from us, please use the email link.' ) );
    $response->header( 'Cache-Control', 'no-store' );
    return $response;
}
add_action( 'tfe_clear_enquiry_lock', 'delete_option' );

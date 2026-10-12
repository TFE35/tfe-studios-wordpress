<?php
/** Private, bounded uploads. No external scanning and no Media Library storage. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function tfe_private_upload_dir() {
    if ( ! defined( 'TFE_PRIVATE_UPLOAD_DIR' ) || ! is_string( TFE_PRIVATE_UPLOAD_DIR ) ) { return false; }
    $dir = realpath( TFE_PRIVATE_UPLOAD_DIR );
    if ( ! $dir || ! is_dir( $dir ) || ! is_writable( $dir ) || is_link( TFE_PRIVATE_UPLOAD_DIR ) ) { return false; }
    // Shared-host accounts must not read each other's enquiry files.
    if ( DIRECTORY_SEPARATOR === '/' && ( fileperms( $dir ) & 0077 ) !== 0 ) { return false; }
    foreach ( array( ABSPATH, isset( $_SERVER['DOCUMENT_ROOT'] ) ? $_SERVER['DOCUMENT_ROOT'] : ABSPATH ) as $root ) {
        $root = realpath( $root );
        if ( $root && ( $dir === $root || strpos( $dir . DIRECTORY_SEPARATOR, rtrim( $root, DIRECTORY_SEPARATOR ) . DIRECTORY_SEPARATOR ) === 0 ) ) { return false; }
    }
    return $dir;
}
function tfe_attachment_ready() {
    return defined( 'TFE_CLAMSCAN_BINARY' ) && is_string( TFE_CLAMSCAN_BINARY ) && is_file( TFE_CLAMSCAN_BINARY ) && is_executable( TFE_CLAMSCAN_BINARY ) && function_exists( 'proc_open' ) && class_exists( 'finfo' ) && tfe_private_upload_dir();
}
function tfe_attachments_enabled() {
    return get_theme_mod( 'tfe_attachments_enabled', false ) && tfe_attachment_ready();
}
function tfe_scan_document( $path ) {
    if ( ! tfe_attachment_ready() ) { return new WP_Error( 'scanner', 'Document scanning is unavailable. Send your enquiry without attachments.', array( 'status' => 503 ) ); }
    // An argv array invokes no shell. Neither the command nor flags are visitor-controlled.
    $command = array( TFE_CLAMSCAN_BINARY, '--stdout', '--no-summary', '--max-filesize=4M', '--max-scansize=32M', '--max-files=500', '--max-recursion=10', '--alert-exceeds-max=yes', '--alert-encrypted=yes', $path );
    $pipes = array();
    $process = @proc_open( $command, array( 0 => array( 'pipe', 'r' ), 1 => array( 'pipe', 'w' ), 2 => array( 'pipe', 'w' ) ), $pipes );
    if ( ! is_resource( $process ) ) { return new WP_Error( 'scanner', 'Document scanning could not start. Send without attachments.', array( 'status' => 503 ) ); }
    fclose( $pipes[0] ); stream_set_blocking( $pipes[1], false ); stream_set_blocking( $pipes[2], false );
    $output = ''; $errors = ''; $deadline = microtime( true ) + 25; $exit = -1;
    do {
        $output .= stream_get_contents( $pipes[1] ); $errors .= stream_get_contents( $pipes[2] );
        $state = proc_get_status( $process );
        if ( ! $state['running'] ) { $exit = $state['exitcode']; break; }
        if ( microtime( true ) > $deadline || strlen( $output ) + strlen( $errors ) > 16384 ) { proc_terminate( $process, 9 ); break; }
        usleep( 20000 );
    } while ( true );
    $output .= stream_get_contents( $pipes[1] ); $errors .= stream_get_contents( $pipes[2] );
    fclose( $pipes[1] ); fclose( $pipes[2] ); proc_close( $process );
    if ( 1 === $exit ) { return new WP_Error( 'unsafe_file', 'An attachment was rejected by the security scan. Remove it and send again.', array( 'status' => 422 ) ); }
    if ( 0 !== $exit || '' !== trim( $errors ) || trim( $output ) !== $path . ': OK' ) { return new WP_Error( 'scanner', 'An attachment could not be fully scanned. Send without attachments.', array( 'status' => 503 ) ); }
    return true;
}
function tfe_document_type( $path, $name ) {
    $ext = strtolower( pathinfo( $name, PATHINFO_EXTENSION ) );
    $mime = ( new finfo( FILEINFO_MIME_TYPE ) )->file( $path );
    $allowed = array( 'pdf' => 'application/pdf', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg' );
    if ( isset( $allowed[$ext] ) && $mime === $allowed[$ext] ) { return $ext; }
    if ( 'docx' !== $ext || ! in_array( $mime, array( 'application/zip', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ), true ) || ! class_exists( 'ZipArchive' ) ) { return false; }
    $zip = new ZipArchive();
    if ( true !== $zip->open( $path ) ) { return false; }
    $valid = $zip->numFiles > 0 && $zip->numFiles <= 500 && false !== $zip->locateName( '[Content_Types].xml' ) && false !== $zip->locateName( 'word/document.xml' );
    $expanded = 0;
    for ( $i = 0; $valid && $i < $zip->numFiles; $i++ ) {
        $entry = $zip->statIndex( $i );
        if ( ! $entry ) { $valid = false; break; }
        $expanded += $entry['size'];
        $entry_name = str_replace( '\\', '/', $entry['name'] );
        if ( $expanded > 32 * 1024 * 1024 || $entry['size'] > 8 * 1024 * 1024 || preg_match( '#(^/|(^|/)\.\.(/|$)|\.bin$|^word/embeddings/)#i', $entry_name ) || ! empty( $entry['encryption_method'] ) ) { $valid = false; }
    }
    if ( $valid ) {
        $types = $zip->getFromName( '[Content_Types].xml', 65537 );
        $valid = is_string( $types ) && strlen( $types ) <= 65536 && false === stripos( $types, 'macroEnabled' ) && false !== strpos( $types, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml' );
    }
    $zip->close(); return $valid ? 'docx' : false;
}
function tfe_upload_entries( $files ) {
    if ( empty( $files ) ) { return array(); }
    if ( ! is_array( $files ) || array_keys( $files ) !== array( 'documents' ) || ! is_array( $files['documents'] ) ) { return new WP_Error( 'files', 'Invalid document upload.', array( 'status' => 400 ) ); }
    $group = $files['documents']; $entries = array();
    foreach ( array( 'name', 'tmp_name', 'size', 'error' ) as $key ) { if ( ! isset( $group[$key] ) || ! is_array( $group[$key] ) ) { return new WP_Error( 'files', 'Invalid document upload.', array( 'status' => 400 ) ); } }
    foreach ( array( 'tmp_name', 'size', 'error' ) as $key ) { if ( array_keys( $group[$key] ) !== array_keys( $group['name'] ) ) { return new WP_Error( 'files', 'Invalid document upload.', array( 'status' => 400 ) ); } }
    if ( count( $group['name'] ) > 3 ) { return new WP_Error( 'files', 'Attach up to three documents.', array( 'status' => 400 ) ); }
    foreach ( $group['name'] as $i => $name ) {
        if ( ! isset( $group['error'][$i], $group['tmp_name'][$i], $group['size'][$i] ) || ! is_string( $name ) || ! is_string( $group['tmp_name'][$i] ) || ! is_int( $group['error'][$i] ) || ! is_int( $group['size'][$i] ) ) { return new WP_Error( 'files', 'Invalid document upload.', array( 'status' => 400 ) ); }
        if ( UPLOAD_ERR_NO_FILE === $group['error'][$i] ) { continue; }
        if ( UPLOAD_ERR_OK !== $group['error'][$i] ) { return new WP_Error( 'files', 'A document could not upload. Check its size and try again.', array( 'status' => 400 ) ); }
        $entries[] = array( 'name' => $name, 'tmp_name' => $group['tmp_name'][$i], 'size' => $group['size'][$i] );
    }
    return $entries;
}
function tfe_prepare_documents( $entries ) {
    if ( ! $entries ) { return array(); }
    if ( ! tfe_attachments_enabled() ) { return new WP_Error( 'scanner', 'Document uploads are unavailable. Send without attachments.', array( 'status' => 503 ) ); }
    $total = 0;
    foreach ( $entries as $entry ) {
        if ( ! is_uploaded_file( $entry['tmp_name'] ) ) { return new WP_Error( 'files', 'Invalid document upload.', array( 'status' => 400 ) ); }
        $size = filesize( $entry['tmp_name'] ); $total += $size;
        if ( $size < 1 || $size !== $entry['size'] || $size > 4 * 1024 * 1024 || $total > 8 * 1024 * 1024 ) { return new WP_Error( 'files', 'Use up to 4 MB per file and 8 MB in total.', array( 'status' => 400 ) ); }
        if ( ! tfe_document_type( $entry['tmp_name'], $entry['name'] ) ) { return new WP_Error( 'files', 'Use PDF, DOCX, JPG or PNG. Encrypted or macro-enabled documents are not supported.', array( 'status' => 400 ) ); }
    }
    $paths = array();
    try {
        foreach ( $entries as $entry ) {
            $ext = strtolower( pathinfo( $entry['name'], PATHINFO_EXTENSION ) );
            $path = tfe_private_upload_dir() . DIRECTORY_SEPARATOR . 'tfe-' . bin2hex( random_bytes( 16 ) ) . '.' . $ext;
            // Recover private files even if PHP is interrupted before the finally block.
            $cleanup = wp_schedule_single_event( time() + HOUR_IN_SECONDS, 'tfe_delete_private_upload', array( $path ), true );
            if ( ! $cleanup || is_wp_error( $cleanup ) ) { throw new RuntimeException( 'cleanup' ); }
            if ( ! move_uploaded_file( $entry['tmp_name'], $path ) ) { throw new RuntimeException( 'move' ); }
            $paths[] = $path;
            if ( ! chmod( $path, 0600 ) ) { throw new RuntimeException( 'permissions' ); }
            $scan = tfe_scan_document( $path );
            if ( is_wp_error( $scan ) ) { tfe_delete_documents( $paths ); return $scan; }
        }
        return $paths;
    } catch ( Throwable $error ) {
        tfe_delete_documents( $paths );
        return new WP_Error( 'files', 'Documents could not be processed. Send without attachments.', array( 'status' => 503 ) );
    }
}
function tfe_delete_private_upload( $path ) {
    $dir = tfe_private_upload_dir();
    if ( $dir && is_string( $path ) && dirname( $path ) === $dir && preg_match( '/^tfe-[a-f0-9]{32}\.(pdf|docx|jpe?g|png)$/', basename( $path ) ) && ! is_link( $path ) && is_file( $path ) ) { unlink( $path ); }
}
function tfe_delete_documents( $paths ) { foreach ( $paths as $path ) { tfe_delete_private_upload( $path ); } }
add_action( 'tfe_delete_private_upload', 'tfe_delete_private_upload' );

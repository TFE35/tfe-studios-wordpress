# Direct enquiries and private document scanning

Candidate 0.4.0 emails website enquiries through WordPress and the configured authenticated SMTP service to the TFE Content general recipient (approved: info@tfestudios.com). Visitors stay on the website. The visitor address is Reply-To; the authenticated sender belongs in the mail plugin. Enable website enquiries in TFE Content only after privacy and actual delivery checks. Disabled delivery leaves the explicit email link available.

## DreamHost gate

Shared hosting does not allow user-run persistent processes: https://help.dreamhost.com/hc/en-us/articles/214869648-Persistent-processes . This candidate uses an on-demand `clamscan` executable, not a daemon. That does NOT establish Shared/DreamPress support: DreamHost must confirm executable availability, maintained signatures, PHP process access and resource limits. No scanner was installed or verified on the hosting account. No external scanning service is used. Attachments default off.

Ask DreamHost support:

> For tfestudios.com and its isolated staging installation, what exact hosting plan is active? Can PHP run an on-demand, maintained ClamAV clamscan executable via proc_open, with up-to-date signatures and sufficient memory/time to scan up to three 4 MB documents (8 MB total) before emailing? Please provide the approved absolute binary path and a private writable directory outside ALL website document roots, owned by the PHP account with mode 0700. Can the request/proxy/PHP timeouts accommodate up to 75 seconds of scanning plus SMTP, and can a host cron reliably clean interrupted uploads? If unsupported, please say so; do not enable unscanned uploads.

No support message has been sent. Confirm this before host configuration. Do not install persistent services on Shared hosting.

## Host configuration (staging first)

An administrator must configure these constants in wp-config.php outside this repository, using host-confirmed paths, not these placeholders:

```php
define('TFE_PRIVATE_UPLOAD_DIR', '/host-confirmed/private-directory');
define('TFE_CLAMSCAN_BINARY', '/host-confirmed/bin/clamscan');
```

The private directory must already exist, be owned by the PHP account, have permissions 0700, and be outside every hosted site's public roots. The code rejects directories under the current WordPress/document root; the operator must also check all other sites. Do not place it in uploads, the theme, or a publicly served directory. Require PHP fileinfo; DOCX also needs ZipArchive. No shell command is constructed from visitor input. Credentials and host paths stay out of Git.

Configure PHP upload_max_filesize >= 4M, post_max_size >= 9M and max_file_uploads >= 3. The client allows 90 seconds for attached enquiries; host request/PHP/proxy limits must allow the scan budget plus mail time. Each scan is bounded to 25 seconds; slow or incomplete checks reject the enquiry. Maintain ClamAV signatures using the host's approved update mechanism. Test missing/stale/corrupt signatures and incompatible flags; do not assume an executable alone proves readiness. ClamAV options: https://docs.clamav.net/manual/Usage/Scanning.html .

The admin attachment checkbox is unavailable without the binary, private directory and process/fileinfo support. Its readiness check is configuration-only. After actual scanner testing, enable it in TFE Content. Three files maximum: PDF, DOCX, JPG/JPEG, PNG, 4 MB per file and 8 MB total. Extension and detected MIME must agree; DOCX container entries/expanded sizes are checked. Macro/embedded binary DOCX content is rejected. ClamAV rejects encrypted/limit-exceeding files. A clean scan reduces risk; it cannot guarantee a document is harmless.

Temporary files receive random names and mode 0600. Nothing is added to the Media Library. Files are removed after mail acceptance, rejection or exception; an hour-later WP-Cron callback is scheduled before moving each file as an interruption fallback. Reliable cron is required. Host administrators must also maintain an age-based private-directory cleanup for orphan files if the theme is disabled, PHP is killed, settings change or WP-Cron fails. A scheduled database record can retain the random temporary path until its callback runs. Do not claim guaranteed one-hour deletion without operational evidence.

## Privacy and verification

Update the real published privacy policy before enabling attachments: documents are processed temporarily on the hosting server and accepted documents are emailed to TFE Studios; no third-party scanning is used. Mailboxes, SMTP plugin logs, hosting temporary uploads/backups and mail services can have their own retention. Determine and disclose those actual settings; this source does not set a mailbox retention period. The existing salted rate keys expire after one hour and request hashes after up to one day via WP-Cron. Avoid sensitive documents.

On authenticated, non-indexed staging test clean files in every allowed format, a scanner vendor test signature (never real malware), encrypted PDF/DOCX, macros, disguised extensions, oversized files, archive expansion limits, missing signatures, scanner errors/timeouts, cleanup and mail failure. Verify no mail is attempted when any scan fails. Confirm actual inbox receipt with each attachment and Reply-To replies. wp_mail success indicates mail-service acceptance, not inbox receipt. Test browser input retention after failure, successful reset, keyboard/mobile selection and plaintext enquiries with uploads disabled. Exclude token and POST endpoints from caching; ensure caching/minification plugins preserve multipart submissions.

The automated multipart test uses a labelled scanner stub and mocked mail. It validates integration and cleanup, not real antivirus efficacy, DreamHost compatibility or inbox delivery. No production deployment is performed by this change. Preserve the previously active theme and settings; disabling attachments in TFE Content is the immediate feature rollback.

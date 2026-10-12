# Document uploads without a scanner — v0.5.0

The user explicitly requested uploads without antivirus scanning on 2026-10-12. This release removes the ClamAV dependency and does not send documents to an external scanning service. No uploaded file is asserted safe. Website/admin text clearly says attachments are not virus-scanned.

## Delivery and activation

The theme calls WordPress wp_mail, so the existing WP Mail SMTP plugin handles delivery to the TFE Content general recipient (approved: info@tfestudios.com). Visitors stay on the website. The authenticated sender remains in the plugin; the visitor is Reply-To. No SMTP credentials belong in the theme or Git. Mail acceptance does not establish inbox receipt.

On staging, publish the reviewed enquiry privacy policy, enable server enquiries in TFE Content, then enable document uploads. Both switches remain off by default. The live policy was observed as a draft on 2026-10-12; this code does not publish it or waive that gate. This release has not been installed by the agent.

## Storage and limits

Without TFE_PRIVATE_UPLOAD_DIR, the theme creates an owner-only site-specific directory under PHP system temporary storage. It rejects a temporary base inside the current WordPress/document root, and never falls back to public uploads. The directory name is derived using a site salt, with mode 0700 on Linux. Files use random names and mode 0600. No Media Library records or public download links are created.

The hosting administrator must verify that the temporary base is outside ALL hosted sites' document roots, that PHP can create/write that directory, and that host temporary storage and backups meet the company's retention policy. If necessary, configure an existing owner-only private directory via TFE_PRIVATE_UPLOAD_DIR in wp-config.php outside this repository. No ClamAV binary or process permissions are needed. Missing fileinfo, private storage or scheduled cleanup rejects attached enquiries. DOCX also requires ZipArchive.

Allow PDF, DOCX, JPG/JPEG and PNG only; maximum three files, 4 MB each, 8 MB total. Extension and detected MIME must agree. DOCX container entries/expanded sizes are bounded; macros and embedded binary DOCX content are rejected. These checks do not detect all malware or make documents safe. This version does not promise rejection of encrypted PDF files. PHP upload_max_filesize should be at least 4M, post_max_size at least 9M, and max_file_uploads at least 3. Client timeout is 60 seconds for attached enquiries, 20 seconds for plain text; host limits may still interrupt delivery.

Temporary files are deleted after mail acceptance/rejection/exception. A one-hour WP-Cron callback is scheduled before moving each file for interruption recovery. Reliable cron is required; an administrator must also provide age-based orphan cleanup when the theme is disabled, salts/paths change or cron fails. Scheduled records can retain random file paths until the callback runs. This does not set a mailbox retention period or guarantee deletion within one hour after interruption.

## Verification and privacy

Test actual staging private storage, nonce/consent, every accepted type, disguised/oversized/too-many files, DOCX macro/embedding/expansion rejection, mail failure and private-file cleanup. Confirm actual inbox receipt with attachments and Reply-To replies. Exclude the token and POST endpoints from all caches. Keep the direct email link.

The privacy policy must describe temporary on-host processing and email delivery, actual mailbox/plugin-log/provider retention and who accesses enquiries. The theme does not store message bodies in its database, but WP Mail SMTP logging configuration, hosting backups and mail providers may retain them. Existing salted rate keys expire after one hour and request hashes after up to one day via WP-Cron. Do not publish invented retention periods.

Native automated multipart tests use mocked mail and no scanner. They validate limits, private storage and cleanup, not file safety, managed-host compatibility or inbox delivery. Preserve v0.4.0 and the active configuration for rollback; immediately disable uploads in TFE Content if needed. No production deployment or privacy publication is performed by this change.

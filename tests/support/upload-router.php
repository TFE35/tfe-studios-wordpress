<?php
// Local integration fixture only. Never sends email or loads production credentials.
define('ABSPATH', __DIR__);define('HOUR_IN_SECONDS',3600);define('DAY_IN_SECONDS',86400);
if(!isset($_GET['auto_storage']))define('TFE_PRIVATE_UPLOAD_DIR',getenv('TFE_TEST_PRIVATE'));
class WP_Error {public $code;public $message;public $data;function __construct($c,$m,$d){$this->code=$c;$this->message=$m;$this->data=$d;}}
class WP_REST_Response {public $data;function __construct($d){$this->data=$d;}function header($k,$v){}}
class Request {function get_header($n){return $_SERVER['CONTENT_TYPE']??'';}function get_body_params(){return $_POST;}function get_json_params(){return json_decode(file_get_contents('php://input'),true);}function get_body(){return file_get_contents('php://input');}function get_file_params(){return $_FILES;}}
$calls=0;$attached=0;$options=array();$transients=array();
function add_action($h,$c){}function is_wp_error($v){return $v instanceof WP_Error;}
function get_theme_mod($k,$d){return true;}function get_privacy_policy_url(){return '/privacy';}
function wp_verify_nonce($n,$a){return $n==='valid';}function sanitize_email($v){return filter_var($v,FILTER_SANITIZE_EMAIL);}function is_email($v){return filter_var($v,FILTER_VALIDATE_EMAIL);}
function sanitize_text_field($v){return trim(strip_tags($v));}function sanitize_textarea_field($v){return trim(strip_tags($v));}
function tfe_setting($k){return 'info@tfestudios.com';}function wp_unslash($v){return stripslashes($v);}function wp_salt($t){return 'fixture-salt-'.getenv('TFE_TEST_PRIVATE');}
function get_transient($k){return $GLOBALS['transients'][$k]??false;}function set_transient($k,$v,$e){$GLOBALS['transients'][$k]=$v;}
function add_option($k,$v,$d='',$a=false){if(isset($GLOBALS['options'][$k]))return false;$GLOBALS['options'][$k]=$v;return true;}
function get_option($k){return $GLOBALS['options'][$k]??false;}function delete_option($k){unset($GLOBALS['options'][$k]);}
function wp_schedule_single_event($t,$h,$args,$error=false){return !isset($_GET['cron_failure']);}
function wp_mail($to,$subject,$body,$headers,$files=array()){
 $GLOBALS['calls']++;$GLOBALS['attached']=count($files);
 foreach($files as $p){if(!is_file($p)||(fileperms($p)&0777)!==0600)throw new Exception('Private scanned file missing');}
 if(isset($_GET['mail_exception']))throw new Exception('fixture-mail');
 return !isset($_GET['mail_failure']);
}
$theme=dirname(__DIR__,2).'/wp-content/themes/tfe-studios-motion';require $theme.'/inc/attachments.php';require $theme.'/inc/enquiries.php';
$r=tfe_receive_enquiry(new Request());$status=is_wp_error($r)?$r->data['status']:200;
http_response_code($status);header('Content-Type: application/json');echo json_encode(array('code'=>is_wp_error($r)?$r->code:'ok','calls'=>$calls,'attached'=>$attached,'remaining'=>count(glob((defined('TFE_PRIVATE_UPLOAD_DIR')?TFE_PRIVATE_UPLOAD_DIR:tfe_private_upload_dir()).'/tfe-*'))));

if(isset($_GET['auto_storage'])) { $dir=tfe_private_upload_dir(); if($dir && count(glob($dir.'/*'))===0)rmdir($dir); }

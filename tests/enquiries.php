<?php
/** Endpoint tests with mocked WordPress services. Never sends external email. */
define('ABSPATH', '/'); define('HOUR_IN_SECONDS',3600); define('DAY_IN_SECONDS',86400);
class WP_Error { public $code; public $data; public function __construct($code,$message,$data){$this->code=$code;$this->data=$data;} }
class WP_REST_Response { public $data; public function __construct($data){$this->data=$data;} public function header($key,$value){} }
class Request { public $data; public function __construct($data){$this->data=$data;} public function get_json_params(){return $this->data;} public function get_body(){return json_encode($this->data);} }
$enabled=true;$mail=true;$calls=0;$transients=array();$options=array();
function add_action($hook,$callback){}
function get_theme_mod($key,$default){return $GLOBALS['enabled'];}
function get_privacy_policy_url(){return '/privacy/';}
function wp_verify_nonce($nonce,$action){return $nonce==='valid';}
function sanitize_email($value){return filter_var($value,FILTER_SANITIZE_EMAIL);}
function is_email($value){return filter_var($value,FILTER_VALIDATE_EMAIL);}
function sanitize_text_field($value){return trim(strip_tags($value));}
function sanitize_textarea_field($value){return trim(strip_tags($value));}
function tfe_setting($key){return 'info@tfestudios.com';}
function wp_unslash($value){return stripslashes($value);}
function wp_salt($type){return 'local-test-salt';}
function get_transient($key){return $GLOBALS['transients'][$key]??false;}
function set_transient($key,$value,$expiry){$GLOBALS['transients'][$key]=$value;}
function add_option($key,$value,$deprecated='',$autoload=false){if(isset($GLOBALS['options'][$key]))return false;$GLOBALS['options'][$key]=$value;return true;}
function get_option($key){return $GLOBALS['options'][$key]??false;}
function delete_option($key){unset($GLOBALS['options'][$key]);}
function wp_schedule_single_event($time,$hook,$args){}
function wp_mail($recipient,$subject,$body,$headers){$GLOBALS['calls']++;return $GLOBALS['mail'];}
$theme = defined('TFE_TEST_THEME_PATH') ? TFE_TEST_THEME_PATH : dirname(__DIR__) . '/wp-content/themes/tfe-studios-motion';
require $theme . '/inc/enquiries.php';
function expect_error($input,$code){$r=tfe_receive_enquiry(new Request($input));if(!($r instanceof WP_Error)||$r->code!==$code)throw new Exception('Expected '.$code);}
$base=array('nonce'=>'valid','name'=>'Test','email'=>'visitor@example.org','service'=>'Brand & identity','message'=>'Test only','website'=>'','consent'=>'yes','request_id'=>'12345678-1234-1234-1234-123456789abc');
$enabled=false;expect_error($base,'disabled');$enabled=true;
expect_error(array_merge($base,array('email'=>array('bad'))),'invalid');
expect_error(array_merge($base,array('nonce'=>'expired')),'expired');
expect_error(array_merge($base,array('website'=>'spam')),'invalid');
expect_error(array_merge($base,array('consent'=>'')),'invalid');
expect_error(array_merge($base,array('service'=>'unsupported')),'invalid');
expect_error(array_merge($base,array('email'=>"visitor@example.org\r\nBcc: victim@example.org")),'invalid');
if($calls!==0)throw new Exception('Invalid input dispatched email');
$r=tfe_receive_enquiry(new Request($base));if(!($r instanceof WP_REST_Response)||$calls!==1)throw new Exception('Valid request failed');
expect_error($base,'duplicate');if($calls!==1)throw new Exception('Duplicate dispatched twice');
$mail=false;expect_error(array_merge($base,array('request_id'=>'22345678-1234-1234-1234-123456789abc')),'mail');
$transients['tfe_global_mail_rate']=50;expect_error(array_merge($base,array('request_id'=>'32345678-1234-1234-1234-123456789abc')),'rate');
echo 'PASS: disabled, malformed, nonce, honeypot, consent, category, header injection, success, duplicate, mail failure, rate limit';

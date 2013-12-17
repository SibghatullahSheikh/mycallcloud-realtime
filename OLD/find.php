<?php
include 'database.php'; 

// error_reporting(E_ALL);
// ini_set('display_errors', '1');
//echo $allowed_campaigns;

//$_GET["selectCampaigns"];
//$_GET["selectUserGroups"];

// Section A
class AgentInfo {
  public function __construct($status, $lead_id, $callerid,
                              $change, $time, $comments, $db) {
    $this->status = $status;
    $this->lead_id = $lead_id;
    $this->callerid = $callerid;
    $this->change = $change;
    $this->time = $time;
    $this->db = $db;
    $this->dead = false;
    $this->paused = false;
    $this->dispo = false;
    $this->calls_ringing = false;
    $this->calls_waiting_for_agents = false;
    $this->comments = $comments;
    $this->getWaiting();
    $this->getInCall();
    $this->getDispo();
    $this->getCallTime();
  }

  private function getWaiting() {
    if (eregi("READY|CLOSER", $this->status)) {
      $this->waiting = true;
    } else {
      $this->waiting = false;
    }
  }
  
  private function getInCall() {
    // echo $this->status;
    if (eregi("INCALL|QUEUE|3-WAY|PARK", $this->status)){
      $this->in_call = true;
    } else {
      $this->in_call = false;
    }
  }
  
  private function getDispo() {
    if (eregi("READY|PAUSED",$this->status) AND $this->lead_id > 0) {
      $this->time = $this->change;
      $this->status = 'DISPO';
      $this->dispo = true;
      return true;
    }
    // echo 'dispo';
    $this->getPaused();
    $this->getPark();
  }

  private function getPaused() {
    if (eregi("PAUSED",$this->status)) $this->paused = true;
  }

  private function getPark() {
    if (eregi("INCALL",$this->status)) {
      $stmt="SELECT COUNT(*) FROM parked_channels WHERE channel_group='$this->callerid';";
      if ( msquery($stmt, $this->db) ) {
        $this->status = 'PARK';
        return true;
      } else {
        $this->getDead();
      }
    }
    
    $this->getRinging();
  }

  private function getDead() {
    $stmt="SELECT callerid,lead_id,phone_number FROM vicidial_auto_calls";
    $result = $this->db->query($stmt);
    $contains_caller_id = false;
    // print_r($result);
    while ( $row = $result->fetch_assoc() ) {
      $newCallerID = $row['callerid'];
      if ($newCallerID == $this->callerid) {
        $contains_caller_id = true | $contains_caller_id;
      }
    }
    $result->free();
    if ( !$contains_caller_id && !eregi("EMAIL",$this->comments) ) {
      $this->status = 'DEAD';
      $this->dead = true;
    }
  }

  private function getRinging(){
    if (!eregi("LIVE|IVR|CLOSER", $this->status)) $this->calls_ringing = true;
    $this->getCallsWaitingForAgents();
  }

  private function getCallsWaitingForAgents() {
    if (eregi("LIVE", $this->status)) $this->calls_waiting_for_agents = true;
  }

  private function getCallTime() {
    $STARTtime = date("U");
    $state_change = $this->change;
    $call_mostrecent = $this->getCallMostRecent($this->lead_id);
    $call_time = $this->time;
    if (!eregi("INCALL|QUEUE|PARK|3-WAY",$this->status)) {
      $this->call_time_S = ($STARTtime - $state_change);
    } else if (eregi("3-WAY",$this->status)) {
      $this->call_time_S = ($STARTtime - $call_mostrecent);
    } else {
      $this->call_time_S = ($STARTtime - $call_time);
    }
  }

  private function getCallMostRecent($lead_id){
    if ($lead_id!=0) {
      $threewaystmt="SELECT UNIX_TIMESTAMP(last_call_time) from vicidial_live_agents where
      lead_id='$lead_id' and status='INCALL' order by UNIX_TIMESTAMP(last_call_time) desc";
      $threewayrslt = $this->db->query($threewaystmt);
      $call_mostrecent = false;
      if ($threewayrslt->num_rows > 1) {
        $status="3-WAY";
        $call_mostrecent = $threewayrslt->fetch_row();
      }
      $threewayrslt->free();
      return $call_mostrecent;
    }
  }
}

// Section A
$arrayA = array("agents_waiting"=>0, "agents_logged_in"=>0, "agents_in_calls"=>0,
          "current_active_calls"=>0, "agents_in_dead_calls"=>0, "paused_agents"=>0,
          "calls_ringing"=>0, "calls_waiting_for_agents"=>0,"agents_in_dispo"=>0);
$stmt = "SELECT extension, vicidial_live_agents.user, conf_exten,
         vicidial_live_agents.status, vicidial_live_agents.server_ip,
         UNIX_TIMESTAMP(last_call_time), UNIX_TIMESTAMP(last_call_finish),
         call_server_ip, vicidial_live_agents.campaign_id, vicidial_users.user_group,
         vicidial_users.full_name, vicidial_live_agents.comments, vicidial_live_agents.calls_today,
         vicidial_live_agents.callerid, lead_id, UNIX_TIMESTAMP(last_state_change), on_hook_agent,
         ring_callerid, agent_log_id
         FROM vicidial_live_agents, vicidial_users  
         WHERE vicidial_live_agents.user=vicidial_users.user";
$result = $db->query($stmt);

$stmt = "SELECT COUNT(*) from vicidial_auto_calls";
$arrayA['current_active_calls'] = msquery($stmt, $db);

while ( $row = $result->fetch_assoc() )
{
  $status = $row['status'];
  $agent = new AgentInfo($row['status'], $row['lead_id'], $row['callerid'],
                         $row['UNIX_TIMESTAMP(last_state_change)'],
                         $row['UNIX_TIMESTAMP(last_call_time)'],
                         $row['comments'], $db);
  if ($agent->waiting) {
    $arrayA['agents_waiting']++;
    $arrayA['agents_logged_in']++;
  }
  if ($agent->in_call) {
    $arrayA['agents_in_calls']++;
    $arrayA['agents_logged_in']++;
  }
  //++; // nope
  if ($agent->dead AND $agent->call_time_S < 21600 ) {
    $arrayA['agents_in_dead_calls']++;
    $arrayA['agents_logged_in']++;
  }
  if ($agent->paused AND $agent->call_time_S < 21600 ) {
    $arrayA['paused_agents']++;
    $arrayA['agents_logged_in']++;
  }
  if ($agent->calls_ringing) {
    $arrayA['calls_ringing']++;
  }
  if ($agent->calls_waiting_for_agents) $arrayA['calls_waiting_for_agents']++;
  if ($agent->dispo) {
    $arrayA['agents_in_dispo']++;
    $arrayA['agents_logged_in']++;
  }
}
$result->free();












// tableC
$timeTHREEhoursAGO = date("Y-m-d H:i:s", date("U") - 10800);
$arrayC = array();

$stmt = "select count(*) from vicidial_carrier_log where call_date >= \"$timeTHREEhoursAGO\";";
$totalStat = msquery($stmt, $db);

$i=0;
$stmt = "SELECT dialstatus,COUNT(*) as count FROM vicidial_carrier_log where call_date >= \"$timeTHREEhoursAGO\" GROUP BY dialstatus";
$rslt = $db->query($stmt);
while ( $row = $rslt->fetch_assoc() ) {
 	$arrayC[$row['dialstatus']] = number_format(100 * $row['count'] / $totalStat, 2);
 	$i++;
}
$rslt->free();








// tableD
$arrayD = array();
$i = 0; // arrayD index
$dOrder = "";
if ( isset($_GET["dSort"]) && isset($_GET["dOrder"]) ) {
	$dOrder = "order by `".$_GET["dSort"].'` '.$_GET["dOrder"];
}
$timeNow = date("U");
//$stmt = "SELECT status,campaign_id as 'campaign',phone_number as 'phone',server_ip,$timeNow - UNIX_TIMESTAMP(call_time) as 'time',call_type as 'callType',queue_priority as 'priority',agent_only from vicidial_auto_calls where status NOT IN('XFER') and ( (call_type='IN' and campaign_id IN($closer_campaignsSQL)) or (call_type IN('OUT','OUTBALANCE') $LOGallowed_campaignsSQL) ) $dOrder";
$stmt = "SELECT status,campaign_id as 'campaign',phone_number as 'phone',server_ip,$timeNow - UNIX_TIMESTAMP(call_time) as 'time',call_type as 'callType',queue_priority as 'priority',agent_only from vicidial_auto_calls where status ='LIVE' $dOrder";
$rslt = $db->query($stmt);
while ( $row = $rslt->fetch_assoc() ) {
	$row['time'] = gmdate('G:i:s', $row['time']);
	$arrayD[$i] = $row;
	$i++;
}










// tableE
$arrayE = array();
$i = 0; // arrayD index
function timeFormat($time) {
	$sec = $time % 100;
	$min = (int) ($time / 100);
	$hour = (int) ($min / 100);
	if ($hour < 1) {
		$min = $min;
	} else {
		$min = $min % 100;
		$min = $min + $hour * 60;
	}
	return $min.':'.$sec;
}
$eOrder = "";
if ( isset($_GET["eSort"]) && isset($_GET["eOrder"]) ) {
	if ($_GET["eSort"] == 'status') {
		$_GET["eSort"] = "CAST(status as char)";
	}
	if  ($_GET["eSort"] == 'contact') {
		$_GET["eSort"] = "contacts";
	}
	if  ($_GET["eSort"] == 'transfer') {
		$_GET["eSort"] = "transfers";
	}
	if  ($_GET["eSort"] == 'success') {
		$_GET["eSort"] = "successes";
	}
	$eOrder = "order by `".$_GET["eSort"]."` ".$_GET["eOrder"];
}

$stmt = "select vicidial_users.user as 'userid', vicidial_users.full_name as 'user', vicidial_users.user_group as 'group', vicidial_live_agents.status as 'status', vicidial_live_agents.conf_exten as 'session-id', vicidial_live_agents.comments as 'type', UNIX_TIMESTAMP(last_update_time) - UNIX_TIMESTAMP(last_call_time) as 'time', SUBSTRING_INDEX(vicidial_live_agents.extension, '/', -1) AS 'extension', vicidial_live_agents.campaign_id as 'campaign', vicidial_live_agents.calls_today as 'calls', vicidial_live_agents.extension as 'station', (case when realtime.contacts>0 then realtime.contacts else 0 end) 'contacts', (case when realtime.successes>0 then realtime.successes else 0 end) 'successes', (case when realtime.transfers>0 then realtime.transfers else 0 end) 'transfers', vicidial_campaigns.closer_campaigns as 'in-group', vicidial_live_agents.server_ip as 'server_ip' from vicidial_live_agents,vicidial_users,realtime,vicidial_campaigns where vicidial_live_agents.user=vicidial_users.user and vicidial_live_agents.user=realtime.userid and vicidial_live_agents.campaign_id=vicidial_campaigns.campaign_id group by vicidial_live_agents.user,realtime.userid $eOrder;";
$trouble = $stmt;

$rslt = $db->query($stmt);
while ( $row = $rslt->fetch_assoc() ) {
	$row['time'] = gmdate('G:i:s', $row['time']); 
	$row['type'] = ( $row['type'] == null ? "&nbsp;" : $row['type'] );
	$row['in-group'] = explode(' ', trim($row['in-group'], ' -'));
	$arrayE[$i] = $row;
	$i++;
}
$rslt->free();

$db->close();

echo '{';
echo '"A": ';
echo json_encode($arrayA);
echo ', "C":';
echo json_encode($arrayC);
echo ', "D":';
echo json_encode($arrayD);
echo ', "E":';
echo json_encode($arrayE);
// echo ', "trouble":';
// echo json_encode($trouble);
//echo '"'.$LOGallowed_campaignsSQL.'     '.$PHP_AUTH_USER.'     '.$PHP_AUTH_PW.'     '.$allowed_campaigns.'     '.$allowed_reports.'"';
echo '}';

?>
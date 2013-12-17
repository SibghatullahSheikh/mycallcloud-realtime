<?php

// error_reporting(E_ALL);
// ini_set('display_errors', '1');

session_start();

header ("Content-type: text/html; charset=utf-8");

$agent_ready=0; // Agents Waiting
$agent_total=0; // Agents Logged In
$agent_incall=0; // Agents in Calls
// Agent Avg Wait
$agent_dead=0; // Agents in Dead Calls
$agent_paused=0; // Paused Agents
// Calls Ringing
// Calls Waiting for Agents
$agent_dispo=0; // Agents in Despo

//MySQL Database Connect
include('login.php');

?>

<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="style.css">
<!--[if lt IE 9]>
<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
<link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>
<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script src="./jquery.tablesorter.min.js"></script>
<script async src="./js/options.js"></script>
<script async src="./js/script.js"></script>
<!-- <script async src="./js/visualize.js"></script> -->
<title>MCC</title>
</head>
<body>
	<?php //echo session_id(); ?>
	<div id="background">
		<div><span></span></div>
	</div>
	<div id="page">

		<section id="sectionF">
			<div id="logo"></div>
			<div class="sides" id="dropped">
				<a href="#" class="close" id="closeDropped"></a>
				<header>Dropped %</header>
				<div class="closable">
					<h2>
						<span class="pct_no"></span>
						<span class="pct">%</span>
						<div id="arrows">-</div>
					</h2>
					<h4 id="dropped_no">Dropped - <span></span></h4>
					<h4 id="answered">Answered - <span></span></h4>
				</div>
			</div>
			<div class="sides" id="agentAvgWait">
				<a href="#" class="close" id="closeAgentAvgWait"></a>
				<header>Agent Avg Wait</header>
				<div class="closable">
					<h3></h3>
				</div>
			</div>
			<div class="sides" id="avgTalkTime">
				<a href="#" class="close" id="closeAvgTalkTime"></a>
				<header>Avg Talk Time</header>
				<div class="closable">
					<h3></h3>
				</div>
			</div>
			<div class="sides" id="callsToday">
				<a href="#" class="close" id="closeCallsToday"></a>
				<header>Calls Today</header>
				<div class="closable">
					<h3></h3>
				</div>
			</div>
			<div class="sides" id="avgWrap">
				<a href="#" class="close" id="closeAvgWarp"></a>
				<header>Avg Wrap</header>
				<div class="closable">
					<h3></h3>
				</div>
			</div>
			<div class="sides" id="avgPause">
				<a href="#" class="close" id="closeAvgPause"></a>
				<header>Avg Pause</header>
				<div class="closable">
					<h3></h3>
				</div>
			</div>
			<div class="sides" id="avgAgents">
				<a href="#" class="close" id="closeAvgAgents"></a>
				<header>Avg Agents</header>
				<div class="closable">
					<h3></h3>
				</div>
			</div>
			<div class="sides" id="dialableLeads">
				<a href="#" class="close" id="closeDialableLeads"></a>
				<header>Dialable Leads</header>
				<div class="closable">
					<h3></h3>
				</div>
			</div>
			<div class="sides" id="dialMethod">
				<a href="#" class="close" id="closeDialMethod"></a>
				<header>Dial Method</header>
				<div class="closable">
					<h3></h3>
				</div>
			</div>
			<a href="../Reports/tabs.php" target="_blank" id="tabslink">
				<div class="sides" id="reports">
					<a href="#" class="close" id="closeReports"></a>
					<header>View</header>
					<div class="closable">
						<h3>Reports</h3>
					</div>
				</div>
			</a>
			<div class="clear"></div>
		</section>


		<section id="sectionA">
			<header>
				<a id="reload" href="#"></a>
				<a class="pause" href="#"></a>
				<div id="date" class="header"></div>
				<a id="options" class="header">Options</a>
				<a id="settings" class="header">User Settings</a>
				<a id="webphone" class="header">WebPhone</a>
			</header>		
			<div id="optionsPopup">
				<a href="/vicidial/admin.php">Users</a>
				<a href="/vicidial/admin.php?ADD=10">Campaigns</a>
				<a href="/vicidial/admin.php?ADD=100">Lists</a>
				<a href="/vicidial/admin.php?ADD=1000000">Scripts</a>
				<a href="/vicidial/admin.php?ADD=10000000">Filters</a>
				<a href="/vicidial/admin.php?ADD=1000">Inbound</a>
				<a href="/vicidial/admin.php?ADD=100000">User Groups</a>
				<a href="/vicidial/admin.php?ADD=10000">Remote Agents</a>
				<a href="/vicidial/admin.php?ADD=999998">Admin</a>
				<a href="/vicidial/admin.php?ADD=999999">Reports</a>
				<a href="/vicidial/admin.php?ADD=10">Modify</a>
				<a href="/vicidial/admin.php">Summary</a>
			</div>
			<form id="settingsPopup">
					<div class="leftform">
						<label for="select-campaigns">Select Campaigns</label>
						<select multiple name="select-campaigns" id="select-campaigns">
							
						</select>

						<label for="select-usergroups">Select User Groups</label>
						<select multiple name="select-usergroups" id="select-usergroups">
							<option>All Inbound</option>
							<option>LocalTouch</option>
							<option>Transfer INGroup</option>
							<option>Test</option>
						</select>
					</div>
					<div class="rightform">	
						<label for="refreshrate">Screen Refresh Rate</label>
						<select id="refreshrate" class="dropdown"> class="dropdown"
							<option>5 seconds</option>
							<option>10 seconds</option>
							<option>30 seconds</option>
							<option>60 seconds</option>
							<option>Pause</option>
						</select>
				
						<label for="show-ingroup">Show In Group Stats</label>
						<select id="show-ingroup" class="dropdown">		
							<option>Yes</option>
							<option>No</option>
						</select>
				
						<label for="show-carrier">Show Carrier Stats</label>
						<select id="show-carrier" class="dropdown">
							<label>g</label>
							<option>Yes</option>
							<option>No</option>
						</select>

						<label for="phone-login">Phone Login</label>
						<input id="phone-login" type="tel" />
					</div>
					<input type="submit" value="Submit" />
					<a href="#" class="close" id="closeSettingsPopup"></a>
				</form>
			<div id="agent_ready" class="col0">
						<div class="text">Agents Waiting</div>
						<div class="number"></div>
						<div class="arrow up grey"></div>
						<div class="plus"></div>
						<div class="arrow down grey"></div>
			</div>
			<div id="sectionATable">
				<div id="agent_total" class="col1 row1">
					<div class="text">Agents Logged In</div>
					<div class="number"></div>
				</div>
				<div id="agent_incall" class="col2 row1">
					<div class="text">Agents in Calls</div>
					<div class="number"></div>
				</div>
				<div id="out_total" class="col3 row1">
					<div class="text">Current Active Calls</div>
					<div class="number"></div>
				</div>
				<div id="agent_dead" class="col4 row1">
					<div class="text">Agents in Dead Calls</div>
					<div class="number"></div>
				</div>
				<div id="agent_paused" class="col1 row2">
					<div class="text">Paused Agents</div>
					<div class="number"></div>
				</div>
				<div id="out_ring" class="col2 row2">
					<div class="text">Calls Ringing</div>
					<div class="number"></div>
				</div>
				<div id="out_live" class="col3 row2">
					<div class="text">Calls Waiting for Agents</div>
					<div class="number"></div>
				</div>
				<div id="agent_dispo" class="col4 row2">
					<div class="text">Agents in Dispo</div>
					<div class="number"></div>
				</div>
			</div><!-- end sectionATable -->
		</section>


		<section id="sectionB">
			<div class="closable">
				<div id="alertLogo"></div>
				<label>3 Alerts</label>
				<button id="alertSettings1">Select option</button>
				<button id="alertSettings2">Select option</button>
				<div id="onOff"></div>
			</div>
			<header>Alert Settings</header>
			
			<a class="close" href="#"></a>
		</section><!-- end sectionB -->

		<section id="sectionC">
			<header><h2>Stats</h2></header>
			<div class="closable">
				<div class="col0">
					
					<nav>
						<div class="button">Campaigns</div>
						<div class="button">Carrier</div>
						<div class="button">Ingroup</div>
						<div class="button">Agent</div>
					</nav>
				</div>
				<!-- <div id="answer" class="col1"><div class="number"><span class="pct">%</span></div>Answer</div>
				<div id="busy" class="col2"><div class="number"><span class="pct">%</span></div>Busy</div>
				<div id="cancel" class="col3"><div class="number"><span class="pct">%</span></div>Cancel</div>
				<div id="congestion" class="col4"><div class="number"><span class="pct">%</span></div>Congestion</div>
 -->
				<div id="answer" class="col1">
					<svg class="number"></svg>
					Answer
				</div>
				<div id="busy" class="col2">
					<svg class="number"></svg>
					Busy
				</div>
				<div id="cancel" class="col3">
					<svg class="number"></svg>
					Cancel
				</div>
				<div id="congestion" class="col4">
					<svg class="number"></svg>
					Congestion
				</div>
				
				<div id="upperRight">
					<button>All</button>
					<button>24hrs</button>
					<button>6hrs</button>
					<button>1hr</button>
					<button>15min</button>
					<button>5min</button>
					<button>1min</button>
					
				</div>
			</div>
			<a class="close" href="#"></a>
		</section><!-- end sectionC -->

		<section id="sectionD">
			<a class="close" id="closeSectionD" href="#"></a>
			<header>
				<h2>Calls Waiting</h2>
			</header>
			<div class="closable">
					
				<div class="pause">
					<a href="#"><div class="minipause"></div></a>
					<div class="pauselabel">Pause</div>
				</div>
				
				<nav>
					<button>View</button>
					<form class="options">
						<div class="thing"><input type="checkbox" class="all">All</div>
						<div class="thing"><input type="checkbox" class="campaign">Campaign</div>
						<div class="thing"><input type="checkbox" class="phone">Phone</div>
						<div class="thing"><input type="checkbox" class="time">Time</div>
						<div class="thing"><input type="checkbox" class="callType">Call Type</div>
						<div class="thing"><input type="checkbox" class="priority">Priority</div>
					</form>
					<div class="clear"></div>
				</nav>
				<table id="callsWaitingTable" class="tablesorter">
				<thead>
					<th id="campaign" class="col1"><a class="sort"></a>Campaign<a class="close" href="#"></a></th>
					<th id="phone" class="col2"><a class="sort"></a>Phone<a class="close" href="#"></a></th>
					<th id="time" class="col3"><a class="sort"></a>Time<a class="close" href="#"></a></th>
					<th id="callType" class="col4"><a class="sort"></a>Call Type<a class="close" href="#"></a></th>
					<th id="priority" class="col5"><a class="sort"></a>Priority<a class="close" href="#"></a></th>
				</thead>
					<tbody class="rows"></tbody>
				</table><!-- end callsWaitingTable -->
			</div><!-- end closable -->
		</section><!-- end sectionD -->

		<section id="sectionE">
			<a class="close" id="closeSectionE" href="#"></a>
			<header>
				<h2>Active Resources</h2>
			</header>
			<div class="closable">
				<nav>
					<button>View</button>
					<form class="options">
						<div class="thing"><input type="checkbox" class="user">User</input></div>
						<div class="thing"><input type="checkbox" class="status">Status</input></div>
						<div class="thing"><input type="checkbox" class="time">Time</input></div>
						<div class="thing"><input type="checkbox" class="campaign">Campaign</input></div>
						<div class="thing"><input type="checkbox" class="group">Group</input></div>
						<div class="thing"><input type="checkbox" class="calls">Calls</input></div>
						<div class="thing"><input type="checkbox" class="contact">Contact</input></div>
						<div class="thing"><input type="checkbox" class="transfer">Transfer</input></div>
						<div class="thing"><input type="checkbox" class="success">Success</input></div>
						<div class="thing"><input type="checkbox" class="extension">Extension</input></div>
						<div class="thing"><input type="checkbox" class="station">Station</input></div>
						<div class="thing"><input type="checkbox" class="typeIaQ">Type (I,A,Q)</input></div>
						<div class="thing"><input type="checkbox" class="in-group">In-Group</input></div>
						<div class="thing"><input type="checkbox" class="activityAlert">Activity Alert</input></div>
					</form>
					<div class="clear"></div>
				</nav>
				<table id="activeResourcesTable" class="tablesorter">
				<thead>
					<th id="user" class="col1"><a class="sort"></a>User<a class="close" href="#"></a></th>
					<th id="status" class="col2"><a class="sort"></a>Status<a class="close" href="#"></a></th>
					<th id="time" class="col3"><a class="sort"></a>Time<a class="close" href="#"></a></th>
					<th id="campaign" class="col4"><a class="sort"></a>Campaign<a class="close" href="#"></a></th>

					<th id="group" class="col5"><a class="sort"></a>Group<a class="close" href="#"></a></th>
					<th id="calls" class="col6"><a class="sort"></a>Calls<a class="close" href="#"></a></th>
					<th id="contact" class="col7"><a class="sort"></a>Contact<a class="close" href="#"></a></th>
					<th id="transfer" class="col8"><a class="sort"></a>Transfer<a class="close" href="#"></a></th>
					<th id="success" class="col9"><a class="sort"></a>Success<a class="close" href="#"></a></th>
					
					<th id="extension" class="col10" style="display: none"><a class="sort"></a>Extension<a class="close" href="#"></a></th>
					<th id="station" class="col11" style="display: none"><a class="sort"></a>Station<a class="close" href="#"></a></th>
					<th id="typeIaQ" class="col12" style="display: none"><a class="sort"></a>Type (I,A,Q)<a class="close" href="#"></a></th>
					<th id="in-group" class="col13" style="display: none"><a class="sort"></a>In-Group<a class="close" href="#"></a></th>
					<th id="activityAlert" class="col14" style="display: none"><a class="sort"></a>Activity Alert<a class="close" href="#"></a></th>
				</thead>
					<!-- <div class="clear"></div> -->
					<tbody class="rows">

					</tbody>
				</table>
			</div>
		</section><!-- end sectionE -->

		<div class="clear"></div>
		<div id="popupWrapper">
			<div id="alert">
				<span id="alertmsg"></span>
				<input type="submit" value="OK">
			</div>
			<div id="webphonePopup">
				<a class="minimize" href="#"></a>
				<a class="close" href="#"></a>
				<div class="closable"></div>
			</div>
		</div>

		
	</div>
</body>
</html>
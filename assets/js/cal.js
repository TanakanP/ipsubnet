window.onload = function() {
  var IP_Addr = document.getElementById("IP_Address");
  IP_Addr.addEventListener("input", function(event) {
    var ip = IP_Addr.value.split(".");
    if (ip.length != 4) {
		    IP_Addr.setCustomValidity("Invalid IP Address");
	  }
    else {
      IP_Addr.setCustomValidity("");
    }
    for (var i in ip) {
      var iInt = parseInt(ip[i]);
      if (0 > iInt || 255 < iInt) {
        IP_Addr.setCustomValidity("Invalid IP Address");
		  }
      else {
        IP_Addr.setCustomValidity("");
      }
	  }
  });
}

function change_subnet() {
  var form = document.getElementById("form_network_class");
  switch (form.elements["network_class"].value) {
    case 'any':
      createChoice(1);
      break;
    case 'A':
      createChoice(8);
      break;
    case 'B':
      createChoice(16);
      break;
    case 'C':
      createChoice(24);
      break;
    default:
      break;
  }
  return 0;
}

function createChoice(end) {
  var select = document.getElementById("subnet");
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }
  for (var start = 32; start >= end; start--) {
    var option = document.createElement("option");
    option.value = start;
    var ip = find_IP(start);
    var node = document.createTextNode( ip + "   /   " + start);
    option.appendChild(node);
    select.appendChild(option);
  }
  return 0;
}

function find_IP(bit) {
  var ip = ""
  for (var i = 1; i <= 4; i++) {
    if (bit >= 8) {
      ip += 255;
      bit -= 8;
    } else if (bit > 0) {
      var val = 0;
      for (; bit > 0; bit--) {
        val += Math.pow(2, 8 - bit);
      }
      ip += val;
    } else {
      ip += 0;
    }
    if (i < 4) {
      ip += ".";
    }
  }
  return ip;
}

function find_Network_Addr(ip, subnet_mask) {
  var ip_block = ip.split(".");
  var subnet_block = subnet_mask.split(".");
  var network_Addr = [];
  for (var i = 0; i < 4; i++) {
    network_Addr[i] = subnet_block[i] & ip_block[i];
  }
  return network_Addr.join(".");
}

function find_Broadcast(network_Addr, num) {
  var network_A = network_Addr.split(".");
  for (var i = 3; i >= 0; i--) {
    network_A[i] = parseInt(network_A[i]);
    network_A[i] += num % 256;
    num = Math.floor(num / 256);
  }
  return network_A.join(".");
}

function find_usable(network_Addr, broadcast_Addr, num_usable) {
  if (num_usable == 0) {
    return "NA";
  }
  network_Addr = network_Addr.split(".");
  broadcast_Addr = broadcast_Addr.split(".");
  network_Addr[3] = parseInt(network_Addr[3]) + 1;
  broadcast_Addr[3] = parseInt(broadcast_Addr[3]) - 1;
  return network_Addr.join(".") + " - " + broadcast_Addr.join(".");
}

function find_bin_subnet(subnet_mask) {
  subnet_mask = subnet_mask.split(".");
  for (var i in subnet_mask) {
    subnet_mask[i] = ("00000000" + (subnet_mask[i] >>> 0).toString(2)).substr(-8);
  }
  return subnet_mask.join(".");
}

function find_wildcard(subnet_mask) {
  subnet_mask = subnet_mask.split(".");
  for (var i in subnet_mask) {
    subnet_mask[i] = (~(subnet_mask[i]) & 255);
  }
  return subnet_mask.join(".");
}

function find_ip_class(subnet) {
  if (subnet > 23) {
    return "C";
  } else if (subnet > 15) {
    return "B";
  } else if (subnet > 7) {
    return "A";
  } else {
    return "";
  }
}

function find_ip_type(ip) {
  ip = ip.split(".");
  if ((ip[0] == 10) || (ip[0] == 172 && ip[1] >= 16 && ip[1] <= 31) || (ip[0] == 192 && ip[1] == 168)) {
    return "Private";
  }
  return "Public";
}

function find_bin_ID(ip) {
  ip = ip.split(".");
  for (var i in ip) {
    ip[i] = ("00000000" + (ip[i] >>> 0).toString(2)).substr(-8);
  }
  return ip.join("");
}

var position = "";
function find_start_IP(ip, subnet, code) {
  ip = ip.split(".");
  ip[3] = code;
  position = 3;
  if (subnet < 24) {
    ip[2] = code;
    position = 2;
  }
  if (subnet < 16) {
    ip[1] = code;
    position = 1;
  }
  if (subnet < 8) {
    ip[0] = code;
    position = 0;
  }
  if (code == "*") {
    if (subnet < 8) {
      return "";
    } else {
      return " for " + ip.join(".");
    }
  } else {
    return ip.join(".");
  }
}

function possible_network(ip, subnet, num_host) {
  var div_table_3 = document.getElementById("div-table-3");
  div_table_3.className = "panel panel-default";
  var table = document.createElement("table");
  table.id = "table-3";
  table.className = "panel-body col-md-offset-4";;
  var head = document.createElement("p");
  head.id = "Topic-2";
  head.className = "panel-heading";
  var start_IP = find_start_IP(ip, subnet, 0);
  var start_IP_star = find_start_IP(ip, subnet, "*");
  head.appendChild(document.createTextNode("All possible /" + subnet + " Networks" + start_IP_star));
  div_table_3.appendChild(head);
  div_table_3.appendChild(document.createElement("hr"));
  var tr = document.createElement("tr");
  var th_1 = document.createElement("th");
  var th_2 = document.createElement("th");
  var th_3 = document.createElement("th");
  th_1.appendChild(document.createTextNode("Network Address"));
  th_1.id = "table-3-L";
  th_2.appendChild(document.createTextNode("Usable Host Range"));
  th_2.id = "table-3-M";
  th_3.appendChild(document.createTextNode("Broadcast Address"));
  th_3.id = "table-3-R";
  tr.appendChild(th_1);
  tr.appendChild(th_2);
  tr.appendChild(th_3);
  table.appendChild(tr);
  var plus_ip = Math.pow(2, subnet % 8)
  start_IP = start_IP.split(".");
  for (var i in start_IP) {
    start_IP[i] = parseInt(start_IP[i]);
  }
  for (var i = 1; i <= plus_ip; i++) {
    var broadcast_Addr = find_Broadcast(start_IP.join("."), num_host - 1);
    var usable_host = find_usable(start_IP.join("."), broadcast_Addr, 1);
    var tr = document.createElement("tr");
    var td_1 = document.createElement("td");
    var td_2 = document.createElement("td");
    var td_3 = document.createElement("td");
    td_1.appendChild(document.createTextNode(start_IP.join(".")));
    td_1.id = "table-3-L";
    td_2.appendChild(document.createTextNode(usable_host));
    td_2.id = "table-3-M";
    td_3.appendChild(document.createTextNode(broadcast_Addr));
    td_3.id = "table-3-R";
    tr.appendChild(td_1);
    tr.appendChild(td_2);
    tr.appendChild(td_3);
    table.appendChild(tr);
    start_IP[position] += Math.pow(2, 8 - (subnet % 8));
  }
  div_table_3.appendChild(table);
}

function get_result() {
  var form = document.getElementById("form_calculate");
  var subnet = form.elements["subnet"].value;
  var ip = form.elements["IP_Address"].value;


  var num_host = Math.pow(2, 32 - subnet);
  var num_usable = num_host - 2;
  if (num_usable < 0) {
    num_usable = 0;
  }
  var subnet_mask = find_IP(subnet);
  var network_Addr = find_Network_Addr(ip, subnet_mask);
  var broadcast_Addr = find_Broadcast(network_Addr, num_host - 1);
  var usable_host = find_usable(network_Addr, broadcast_Addr, num_usable);
  var bin_subnet = find_bin_subnet(subnet_mask);
  var wildcard_mask = find_wildcard(subnet_mask);
  var IP_class = find_ip_class(subnet);
  var CIDR_no = "/" + subnet;
  var IP_Type = find_ip_type(ip);
  var short_ID = ip + "  " + CIDR_no;
  var bin_ID = find_bin_ID(ip);
  var int_ID = parseInt(bin_ID, 2);
  var hex_ID = "0x" + int_ID.toString(16);
  var in_addr = ip.split(".").reverse().join(".") + ".in-addr.arpa";


  var header = ["IP Address", "Network Address", "Usable Host IP Range",
    "Broadcast Address", "Total Number of Hosts", "Number of Usable Hosts",
    "Subnet Mask", "Wildcard Mask", "Binary Subnet Mask", "IP Class", "CIDR Notation",
    "IP Type", "Short", "Binary ID", "Integer ID", "Hex ID", "in-addr.arpa",
  ];
  var ans = [ip, network_Addr, usable_host,
    broadcast_Addr, num_host.toLocaleString(), num_usable.toLocaleString(),
    subnet_mask, wildcard_mask, bin_subnet, IP_class, CIDR_no,
    IP_Type, short_ID, bin_ID, int_ID, hex_ID, in_addr,
  ];

  // Add To HTML
  var div_table_2 = document.getElementById("div-table-2");
  while (div_table_2.firstChild) {
    div_table_2.removeChild(div_table_2.firstChild);
  }
  div_table_2.className = "panel panel-default";
  var table_2 = document.createElement("table");
  table_2.id = "table-2";
  table_2.className = "panel-body col-md-offset-4";
  var head = document.createElement("p");
  head.id = "Topic-2";
  head.className = "panel-heading";
  head.appendChild(document.createTextNode("Result"));
  div_table_2.appendChild(head);
  div_table_2.appendChild(document.createElement("hr"));
  for (i in ans) {
    if (ans[i] != "") {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      var th = document.createElement("th");
      th.appendChild(document.createTextNode(header[i]));
      th.id = "table-2-L";
      td.appendChild(document.createTextNode(ans[i]));
      td.id = "table-2-R";
      tr.appendChild(th);
      tr.appendChild(td);
      table_2.appendChild(tr);
    }
  }
  div_table_2.appendChild(table_2);

  var div_table_3 = document.getElementById("div-table-3");
  div_table_3.className = "";
  while (div_table_3.firstChild) {
    div_table_3.removeChild(div_table_3.firstChild);
  }
  if (subnet != 32 && subnet != 24 && subnet != 16 && subnet != 8) {
    possible_network(ip, subnet, num_host);
  }
}

var pos = "";

function calIP(bit) {
  var ip = ""
  for(var i = 1; i <= 4; i++) {
    if (bit >= 8) {
      ip += 255;
      bit -= 8;
    }
    else if(bit > 0) {
      var val = 0;
      for (; bit > 0; bit--) {
        val += Math.pow(2, 8 - bit);
      }
      ip += val;
    }
    else {
      ip += 0;
    }
    if(i < 4) {
      ip += ".";
    }
  }
  return ip;
}

function calstartIP(ip, subnet, code) {
  ip = ip.split(".");
  ip[3] = code;
  pos = 3;
  if (subnet < 24) {
    ip[2] = code;
    pos = 2;
  }
  if (subnet < 16) {
    ip[1] = code;
    pos = 1;
  }
  if (subnet < 8) {
    ip[0] = code;
    pos = 0;
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

function calipClass(subnet) {
  if (subnet < 8) {
    return "";
  }
  else if(subnet < 16) {
    return "A";
  }
  else if(subnet < 24) {
    return "B";
  }
  else {
    return "C";
  }
}

function calipType(ip) {
  ip = ip.split(".");
  if((ip[0] == 10) || (ip[0] == 172 && ip[1] >= 16 && ip[1] <= 31) || (ip[0] == 192 && ip[1] == 168)) {
    return "Private";
  }
  return "Public";
}

function calbinID(ip) {
  ip = ip.split(".");
  for(var i in ip) {
    ip[i] = ("00000000" + (ip[i] >>> 0).toString(2)).substr(-8);
  }
  output = ip.join("");
  return output;
}

function calnetworkAddr(ip, subnetMask) {
  var ip_block = ip.split(".");
  var subnet_block = subnetMask.split(".");
  var nA = [];
  for(var i = 0; i < 4; i++) {
    nA[i] = subnet_block[i] & ip_block[i];
  }
  output = nA.join(".");
  return output;
}

function calBroadcast(networkAddr, num) {
  var nA = networkAddr.split(".");
  for(var i = 3; i >= 0; i--) {
    nA[i] = parseInt(nA[i]);
    nA[i] += num % 256;
    num = Math.floor(num / 256);
  }
  output = nA.join(".");
  return output;
}

function calusable(networkAddr, broadcastAddr, usenum) {
  if(usenum == 0) {
    return "N/A";
  }
  networkAddr = networkAddr.split(".");
  broadcastAddr = broadcastAddr.split(".");
  networkAddr[3] = parseInt(networkAddr[3]) + 1;
  broadcastAddr[3] = parseInt(broadcastAddr[3]) - 1;
  output = networkAddr.join(".") + " - " + broadcastAddr.join(".");
  return output;
}

function calbinSubnet(subnetMask) {
  subnetMask = subnetMask.split(".");
  for(var i in subnetMask) {
    subnetMask[i] = ("00000000" + (subnetMask[i] >>> 0).toString(2)).substr(-8);
  }
  output = subnetMask.join(".");
  return output;
}

function calwildcard(subnetMask) {
  subnetMask = subnetMask.split(".");
  for(var i in subnetMask) {
    subnetMask[i] = (~(subnetMask[i]) & 255);
  }
  output = subnetMask.join(".");
  return output;
}

function choices(end) {
  var select = document.getElementById("subnet");
  select.innerHTML = "";
  for(var start = 32; start >= end; start--) {
    var option = document.createElement("option");
    option.value = start;
    var ip = calIP(start);
    option.appendChild(document.createTextNode( ip + "   /   " + start));
    select.appendChild(option);
  }
  return 0;
}

function change() {
  var form = document.getElementById("form_network_class");
  cls = form.elements["network_class"].value
  if(cls == 'any') {
    choices(1);
  }
  else if(cls == 'A') {
    choices(8);
  }
  else if(cls == 'B') {
    choices(16);
  }
  else if(cls == 'C') {
    choices(24);
  }
  return 0;
}

function possible(ip, subnet, hostnum) {
  var startIP = calstartIP(ip, subnet, 0);
  startIP = startIP.split(".");
  for(var i in startIP) {
    startIP[i] = parseInt(startIP[i]);
  }
  var startIP_star = calstartIP(ip, subnet, "*");
  var plus = Math.pow(2, subnet % 8)
  var tablePossible = document.getElementById("tablePossible");
  var table = document.createElement("table");
  table.align = "center";
  var head = document.createElement("h2");
  head.className = "text-center";
  head.appendChild(document.createTextNode("All possible /" + subnet + " Networks" + startIP_star));
  tablePossible.appendChild(head);
  var h1 = document.createElement("th");
  var h2 = document.createElement("th");
  var h3 = document.createElement("th");
  var tr = document.createElement("tr");
  h1.appendChild(document.createTextNode("Network Address"));
  h2.appendChild(document.createTextNode("Usable Host Range"));
  h3.appendChild(document.createTextNode("Broadcast Address"));
  tr.appendChild(h1);
  tr.appendChild(h2);
  tr.appendChild(h3);
  table.appendChild(tr);
  for(var i = 1; i <= plus; i++) {
    var broadcastAddr = calBroadcast(startIP.join("."), hostnum - 1);
    var usable_host = calusable(startIP.join("."), broadcastAddr, 1);
    var d1 = document.createElement("td");
    var d2 = document.createElement("td");
    var d3 = document.createElement("td");
    var tr = document.createElement("tr")
    d1.appendChild(document.createTextNode(startIP.join(".")));
    d2.appendChild(document.createTextNode(usable_host));
    d3.appendChild(document.createTextNode(broadcastAddr));
    tr.appendChild(d1);
    tr.appendChild(d2);
    tr.appendChild(d3);
    table.appendChild(tr);
    startIP[pos] += Math.pow(2, 8 - (subnet % 8));
  }
  tablePossible.appendChild(table);
}

window.onload = function() {
  var IPAddr = document.getElementById("ip");
  IPAddr.addEventListener("input", function(event) {
    var ip = IPAddr.value.split(".");
    if(ip.length != 4) {
		    IPAddr.setCustomValidity("Invalid IP Address");
	  }
    else {
        IPAddr.setCustomValidity("");
    }
    for(var i in ip) {
      var iInt = parseInt(ip[i]);
      if(0 > iInt || 255 < iInt) {
          IPAddr.setCustomValidity("Invalid IP Address");
		  }
      else {
          IPAddr.setCustomValidity("");
      }
	  }
  });
}

function result() {
  var form = document.getElementById("form_calculate");
  var subnet = form.elements["subnet"].value;
  var ip = form.elements["ip"].value;
  var hostnum = Math.pow(2, 32 - subnet);
  var usenum = hostnum - 2;
  if(usenum < 0) {
    usenum = 0;
  }
  var subnetMask = calIP(subnet);
  var ipClass = calipClass(subnet);
  var CIDRNo = "/" + subnet;
  var ipType = calipType(ip);
  var shortID = ip + "  " + CIDRNo;
  var binID = calbinID(ip);
  var intID = parseInt(binID, 2);
  var hexID = "0x" + intID.toString(16);
  var inAddr = ip.split(".").reverse().join(".") + ".in-addr.arpa";
  var networkAddr = calnetworkAddr(ip, subnetMask);
  var broadcastAddr = calBroadcast(networkAddr, hostnum - 1);
  var usableHost = calusable(networkAddr, broadcastAddr, usenum);
  var binSubnet = calbinSubnet(subnetMask);
  var wildcardMask = calwildcard(subnetMask);

  var name = ["IP Address:", "Network Address:", "Usable Host IP Range:","Broadcast Address:", "Total Number of Hosts:", "Number of Usable Hosts:","Subnet Mask:", "Wildcard Mask:", "Binary Subnet Mask:", "IP Class:", "CIDR Notation:","IP Type:", "Short:", "Binary ID:", "Integer ID:", "Hex ID:", "in-addr.arpa:"];
  var value = [ip, networkAddr, usableHost,broadcastAddr, hostnum.toLocaleString(), usenum.toLocaleString(),subnetMask, wildcardMask, binSubnet, ipClass, CIDRNo,ipType, shortID, binID, intID, hexID, inAddr,];

  var tableResult = document.getElementById("tableResult");
  tableResult.innerHTML = "";
  var table = document.createElement("table");
  table.id = "table";
  table.align = "center";
  var head = document.createElement("h2");
  head.className = "text-center";
  head.appendChild(document.createTextNode("Result"));
  tableResult.appendChild(head);
  for(i in value) {
    if(value[i] != "") {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      var th = document.createElement("th");
      th.appendChild(document.createTextNode(name[i]));
      td.appendChild(document.createTextNode(value[i]));
      tr.appendChild(th);
      tr.appendChild(td);
      table.appendChild(tr);
    }
  }
    tableResult.appendChild(table);

  if(subnet != 8 && subnet != 16 && subnet != 24 && subnet != 32) {
    var tablePossible = document.getElementById("tablePossible");
    tablePossible.innerHTML = "";
    possible(ip, subnet, hostnum);
  }
  else {
    var tablePossible = document.getElementById("tablePossible");
    tablePossible.innerHTML = "";
  }
}

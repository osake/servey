var net = require("net");
var action = require("./commands");
var db_conn = require("./plugins/redis-node-client/lib/redis-client").createClient();

Array.prototype.remove = function(e) {
  for (var i = 0; i < this.length; i++) {
    if (e == this[i]) { return this.splice(i, 1); }
  }
};

function Client(stream) {
  this.name = null;
  this.state = "connecting";
  this.stream = stream;
}

var clients = [];

var prompt = "> ";

var server = net.createServer(function (stream) {
  var client = new Client(stream);
  clients.push(client);

  stream.setTimeout(0);
  stream.setEncoding("utf8");

  stream.addListener("connect", function () {
    stream.write("Welcome, enter your username:\n");
  });

  stream.addListener("data", function (data) {
    if (client.name === null) {
      client.name = data.match(/\S+/);
      db_conn.set(client.name, client.name);
      if (client.name === null) {
        stream.end();
        return; // must have this call or the server breaks
      }
      stream.write("====== WELCOME =====\n" + prompt);
      clients.forEach(function(c) {
        if (c != client && c.state == "active") {
          c.stream.write(client.name + " has joined.\n");
          c.stream.write(prompt);
        }
      });
      return;
    } else {
    
    // if (client.name != null) {
      client.state = "active";
    }

    var command = data.match(/^\/(.*)/);
    if (command && client.state == "active") {
      action.slash_command(command, clients, stream, client);
      client.stream.write(prompt);
      return; // is this what wipes out the rest of the checking below?  guess so...
    }

    command = data.match(/^('|say)(.*)/);
    if (command && client.state == "active") {
      action.say_command(command, clients, stream, client);
      client.stream.write(prompt);
      return; // is this what wipes out the rest of the checking below?  guess so...
    }
  });

  stream.addListener("end", function() {
    clients.remove(client);

    clients.forEach(function(c) {
      c.stream.write(client.name + " has left.\n");
    });

    stream.end();
  });
});

server.listen(7000);



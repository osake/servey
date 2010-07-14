var db_conn = require("./plugins/redis-node-client/lib/redis-client").createClient();
var action = exports;

var commands = 
  ["name",
   "users",
   "state",
   "quit",
   "help"];

action.slash_command = function (command, clients, stream, client) {
  // stream.write("COMMAND: " + command[1] + "\n");
  params = command[1].split(" ");
  switch(params[0]) {
    case "name":
      if(params[1]) {
        db_conn.get(params[1], function(err, name) {
          if(name) {
            stream.write("That name already exists!\n");
          } else {
            db_conn.del(client.name);
            client.name = params[1];
            stream.write("Your new name is " + params[1] + "\n");
          }
        });
      } else {
        stream.write(client.name + "\n");
      }
      break;
    case "users":
      clients.forEach(function(c) {
        stream.write("- " + c.name + "\n");
      });
      break;
    case "state":
      stream.write("You're in the " + client.state + " state\n");
      break;
    case "quit":
      stream.end();
      break;
    case "help":
      commands.forEach(function(c) {
        stream.write("- " + c + "\n");
      });
      break;
    default:
      stream.write(command[1] + " -- Invalid command!\n");
      // no default action, sorry
      break;
  }
};

action.say_command = function (command, clients, stream, client) {
  data = command[1];
  clients.forEach(function(c) {
    if (c.state == "active") {
      c.stream.write(client.name + ": " + data + "\n");
    }
  });
};
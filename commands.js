var action = exports;

action.slash_command = function (command, clients, stream, client) {
  switch(command[1]) {
    case "name":
      if(command) {
        stream.write(command + "<-- new name?\n");
      } else {
        stream.write(client.name + "\n");
      }
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
      stream.write("Help stuff.\n");
    default:
      // no default action, sorry
      break;
  }
}
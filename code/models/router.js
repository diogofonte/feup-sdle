const WebSocket = require('ws');
const routerSocket = new WebSocket.Server({ port: 8080 });

let currentClient = null;
let listServersInfo = new Map(); // key: list code, value: array of two servers
let servers = new Map(); // key: server protocol, value: server connection

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}


routerSocket.on('connection', (connection) => {
  if (connection.protocol.substring(0,6) === 'server') {
    console.log(`${connection.protocol} connected`);

    // Handle messages from servers
    connection.on('message', (message) => {

      if(isInt(JSON.parse(message)[0])) {
        console.log(`Populating listServersInfo and servers with information from ${connection.protocol}`);
        servers.set(connection.protocol, [connection, JSON.parse(message)[0]]);

        JSON.parse(message)[1].forEach(element => {
          if(listServersInfo.get(element)) {
            // if the list is in the listServersInfo, populate the missing value with the server
            if(listServersInfo.get(element)[0]==null) {
              listServersInfo.get(element)[0] = connection.protocol;
            } else if(listServersInfo.get(element)[1]==null) {
              listServersInfo.get(element)[1] = connection.protocol;
            }
          } else {
            // if the list is not in the listServersInfo, add the list to the listServersInfo
              listServersInfo.set(element, [connection.protocol, null]);
          }
        });
      }
      else if(JSON.parse(message) !== "List not found") {
        console.log(`Received desired list from ${connection.protocol}, forwarding to client`);
        currentClient.send(message);
      } else {
        console.log(`List not found in ${connection.protocol}, not forwarding to client`);
      }
    });

    // Disconnects server and removes it from the list of active servers
    connection.on('close', () => {
      console.log(`${connection.protocol} disconnected`);
      servers.delete(connection.protocol);
    });
    // ...
  } else if (connection.protocol === 'client') {
    console.log(`Client connected`);

    // Handle messages from clients
    connection.on('message', (message) => {
      currentClient = connection;

      if(!listServersInfo.get(JSON.parse(message)[0])) {
        // select the servers with the least list count
        const sortedServers = [...servers.entries()].sort((a, b) => a[1][1] - b[1][1]);

        // Selecting the first two servers with the least list count
        const selectedServers = sortedServers.slice(0, 2).map((entry) => entry[0]);

        // Save the selected servers for the list code in listServersInfo
        listServersInfo.set(JSON.parse(message)[0], selectedServers);
      }

      if(listServersInfo.get(JSON.parse(message)[0])) {
        // send message to servers
        if(listServersInfo.get(JSON.parse(message)[0])[0]!=null) {
          if(servers.get(listServersInfo.get(JSON.parse(message)[0])[0])) {
            servers.get(listServersInfo.get(JSON.parse(message)[0])[0])[0].send(message);
          }
        }
        if(listServersInfo.get(JSON.parse(message)[0])[1]!=null) {
          if(servers.get(listServersInfo.get(JSON.parse(message)[0])[1])) {
            servers.get(listServersInfo.get(JSON.parse(message)[0])[1])[0].send(message);
          }
        }
        if(JSON.parse(message)[1]) {
          console.log('Received list : ', JSON.parse(message)[0] ,' : from client');
          console.log('Pushing list to corresponding servers:', listServersInfo.get(JSON.parse(message)[0]));
          // update server list count
          if(servers.get(listServersInfo.get(JSON.parse(message)[0])[0])) {
            servers.get(listServersInfo.get(JSON.parse(message)[0])[0])[1]++;
          }
          if(servers.get(listServersInfo.get(JSON.parse(message)[0])[1])){
            servers.get(listServersInfo.get(JSON.parse(message)[0])[1])[1]++;
          }

        } else {
          console.log('Received list code : ', JSON.parse(message)[0] ,' : from client');
          console.log('Searching for list in corresponding servers:', listServersInfo.get(JSON.parse(message)[0]));
        }
      }

    });

    // Disconnects client
    connection.on('close', () => {
      currentClient = null;
      console.log(`Client disconnected`);
    });
    // ...
  }
});

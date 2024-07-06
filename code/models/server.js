const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');


class Server {
  constructor(port) {
    this.app = express();
    this.port = port;
    const serverNum = Math.abs(this.port) % 10;
    this.routerSocket = new WebSocket('ws://localhost:8080', `server${serverNum}`); // Connect to the router
  }

  async init() {
    this.app.use(bodyParser.json());

    this.routerSocket.on('open', () => {
      console.log('Connected to router');
      // get the list codes of all the list in the server and send it to the router
      const folderName = `/shopping-lists/cloud/server${Math.abs(this.port) % 10}/`;
      const files = fs.readdirSync(path.join(__dirname, '..', folderName));
      const listCodes = files.map((file) => {
        const match = file.match(/^server_\d+_list_(.+)\.json$/);
        return match ? match[1] : '';
      });
      this.routerSocket.send(JSON.stringify([this.listCounter(),listCodes]));
    });

    this.app.get('/', (req, res) => {
      const serverNum = Math.abs(this.port) % 10;
      const folderName = `/shopping-lists/cloud/server${serverNum}/`;

    
      fs.readdir(path.join(__dirname, '..', folderName), (err, files) => {
        if (err) {
          console.error('Error reading directory:', err);
          res.send(`<h1>List Codes Available:</h1><ul>No List Available</ul>`);
        } else {
          const listCodes = files.map((file) => {
            const match = file.match(/^server_\d+_list_(.+)\.json$/);
            return match ? `<li>${match[1]}</li>` : '';
          });
          res.send(`<h1>List Codes Available:</h1><ul>${listCodes.join('')}</ul>`);
        }
      });
    });

    

    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);

      this.routerSocket.on('message', (message) => {
        const clientMessage = JSON.parse(message);
        const server = Math.abs(this.port) % 10
        const folderName = `/shopping-lists/cloud/server${server}/`;
        const fileName = `server_${server}_list_${clientMessage[0]}.json`;
        const currentFilePath = __filename;
        const filePath = path.join(path.dirname(currentFilePath), '..', folderName, fileName);


        if(clientMessage[1]) {
          console.log('Received list from router, storing it in the server');

          if (!fs.existsSync(path.join(path.dirname(currentFilePath), '..', folderName))) {
            fs.mkdirSync(path.join(path.dirname(currentFilePath), '..', folderName));
          }

          clientMessage[1].replicaId = fileName;
            
          fs.writeFileSync(filePath, JSON.stringify(clientMessage[1], null, 2), 'utf8');
          return;
        }

        // Handle messages from the router if needed
        console.log('Received list code from router :', clientMessage[0], ': searching for list in server');

        if(fs.existsSync(filePath)) {
          this.routerSocket.send(fs.readFileSync(filePath, 'utf8'));
          console.log('List found in server, forwarding to router');
        } else {
          this.routerSocket.send(JSON.stringify("List not found"));
          console.log('List not found in server, warning router');
        }

      });

    });
  }

  // get number of lists in server
  listCounter() {
    const serverNum = Math.abs(this.port) % 10;
    const folderName = `shopping-lists/cloud/server${serverNum}/`;
  
    try {
      const files = fs.readdirSync(path.join(__dirname, '..', folderName));
      const listCount = files.length;
      return listCount;
    } catch (err) {
      console.error('Error reading directory:', err);
      // Handle the error if needed
      return 0; // or any default value
    }
  }

  
}

module.exports = Server;
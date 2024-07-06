const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const ShoppingList = require('./shopping-list.js');

const WebSocket = require('ws');

class Client {
    constructor(port, code) {
      this.app = express();
      this.port = port;
      this.code = code;
      this.shopping_list =  new ShoppingList(code);
      this.routerSocket = null;
      this.routerConnected = false;
    }

    async init() {
      this.app.use(express.static('public'));
      this.app.use(express.json());
      this.app.use(bodyParser.json());
  
      this.app.listen(this.port, () => {
        console.log(`Client is running on http://localhost:${this.port}`);
        this.executeShoppingList();
        if(!this.routerConnected) this.connectToRouter();
      });
    }

    async connectToRouter() {
    
      const tryConnect = async () => {
        try {
          this.routerSocket = new WebSocket('ws://localhost:8080', 'client');
    
          this.routerSocket.on('open', () => {
            console.log('Connected to router');
            this.routerConnected = true;
          });
    
          this.routerSocket.on('error', (error) => {
            console.error('Error connecting to router. Router offline. Retrying in 10 seconds');
            this.routerSocket = null;
            this.routerConnected = false;
          });
        } catch (error) {
          console.error('Error connecting to router. Router offline. Retrying in 10 seconds');
          this.routerSocket = null;
          this.routerConnected = false;
        }
    
        if (!this.routerConnected) {
          // Retry after a delay (e.g., 5 seconds)
          await new Promise(resolve => setTimeout(resolve, 10000));
          await tryConnect();
        }
      };
    
      await tryConnect();
    }
    
    

    async searchCloudForList(listCode) {
      var code_in_cloud = false;
      console.log('Searching for list : ', listCode ,' : in cloud');
      this.routerSocket.send(JSON.stringify([listCode, null]));
      this.routerSocket.on('message', (message) => {
        console.log('List found. Received desired list from router');
        this.shopping_list.pullShoppingList(this.port,JSON.parse(message));
        code_in_cloud = true;
      });
      return code_in_cloud;
    }

    async updateCloudList(listCode) {
      this.routerSocket.send(JSON.stringify([listCode, this.shopping_list.loadShoppingList(this.port)]));
      console.log('Sent updated list : ', listCode ,' : to router')
    }

    changeCode(code) {
        this.code = code;
        this.shopping_list.code = code;
        this.shopping_list =  new ShoppingList(code);
    }

    createRandomCode() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const codeLength = 8;
      let newCode;

      do {
        newCode = '';
        for (let i = 0; i < codeLength; i++) {
          newCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
      } while (this.codeExistsLocally(newCode));

      this.code = newCode;
      this.shopping_list.code = newCode;
    }

    codeExistsLocally(code) {  
      const folderName = '/shopping-lists/local/';
      const fileName = `local_client_${this.port}_list_${code}.json`;
      const currentFilePath = __filename;
      const filePath = path.join(path.dirname(currentFilePath), '..', folderName, fileName);

      return fs.existsSync(filePath);
    }
  
    executeShoppingList() {
      this.app.post('/manage-code', (req, res) => {
        this.changeCode(req.body.code);

        if(!this.codeExistsLocally(req.body.code) && req.body.code) {
          if(this.routerConnected) {
            this.searchCloudForList(req.body.code);
          } else {
            console.log('Router offline. Unable to search list in cloud');
          }
        }

        if (req.body.message === "new list") {
          this.createRandomCode();
          this.shopping_list.createShoppingList(this.port);
        }
        res.json({ message: 'List code updated successfully' });
      });

      this.app.post('/merge-list', async (req, res) => {
        // wait for the list to be found in the cloud before merging

        if(this.routerConnected){
          await this.searchCloudForList(this.code);
          await this.updateCloudList(this.code);
        } else {
          console.log('Router offline. List not merged');
        }

        res.json({ message: 'List merged successfully' });
      });
  
      this.app.get('/api/shopping-list', (req, res) => {
        if(!this.shopping_list.loadShoppingList(this.port)){
          res.redirect('/');
        }
        else {
          const response = {
            code: this.code,
            itemsList: this.shopping_list.setWithCounters.elements,
        };
        res.json(response);
        }
      });
  
      // Inside your '/update-list' route
      this.app.post('/update-list', (req, res) => {

          if(req.body.quantityDifference > 0) {
            this.shopping_list.setWithCounters = this.shopping_list.setWithCounters.add(req.body.name, req.body.quantityDifference);
          }
          if(req.body.quantityDifference < 0) {
            this.shopping_list.setWithCounters = this.shopping_list.setWithCounters.remove(req.body.name, -req.body.quantityDifference);
          }
          
          this.shopping_list.storeShoppingList(this.port);
          res.json({ message: 'List updated successfully' });
      });
    }
}

module.exports = Client;
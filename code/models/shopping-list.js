const path = require('path');
const fs = require('fs');
const SetWithCounters = require('../crdts/set-with-counters.js');

class ShoppingList {
    constructor(code) {
        this.code = code;
        this.setWithCounters = new SetWithCounters();
    }

    storeShoppingList(port) {
        const folderName = 'shopping-lists/local/';
        const fileName = `local_client_${port}_list_${this.code}.json`;
    
        // Include initial lines
        const data = {
            listId: this.code,
            replicaId: fileName,
            items: this.setWithCounters.elements,
        };
    
        const currentFilePath = __filename;
        const filePath = path.join(path.dirname(currentFilePath), '..', folderName, fileName);
            
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        // console.log(`Shopping list stored in ${filePath}`);
    }
    

    loadShoppingList(port) {
        this.setWithCounters = new SetWithCounters();

        const folderName = 'shopping-lists/local/';
        const fileName = `local_client_${port}_list_${this.code}.json`;
        const currentFilePath = __filename;
        const filePath = path.join(path.dirname(currentFilePath), '..', folderName, fileName);

        if (!fs.existsSync(filePath)) {
            console.log(`Shopping list with code ${this.code} does not exist.`);
            return null; // Return null as there are no items in the new file
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        for (const itemName in data.items) {
            const itemData = data.items[itemName];
            this.setWithCounters = this.setWithCounters.add(itemName, itemData.add);
            this.setWithCounters = this.setWithCounters.remove(itemName, itemData.remove);
        }

        return data;
    }

    createShoppingList(port) {
        this.setWithCounters = new SetWithCounters();

        const folderName = 'shopping-lists/local/';
        const fileName = `local_client_${port}_list_${this.code}.json`;

        const currentFilePath = __filename;
        const filePath = path.join(path.dirname(currentFilePath), '..', folderName, fileName);

        console.log(`Creating a new file with code ${this.code}...`);
    
        // Create an empty data object to write to the new file
        const newData = {
            listId: this.code,
            replicaId: fileName,
            items: {},
        };

        // Write the new file with the empty data
        fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf8');
        console.log(`New shopping list file created at ${filePath}`);
    }

    pullShoppingList(port,data) {
        const folderName = 'shopping-lists/local/';
        const fileName = `local_client_${port}_list_${this.code}.json`;

        const currentFilePath = __filename;
        const filePath = path.join(path.dirname(currentFilePath), '..', folderName, fileName);

        if (fs.existsSync(filePath)) {

            this.loadShoppingList(port);

            this.otherSetWithCounters = new SetWithCounters();
            for (const itemName in data.items) {
                const itemData = data.items[itemName];
                this.otherSetWithCounters = this.otherSetWithCounters.add(itemName, itemData.add);
                this.otherSetWithCounters = this.otherSetWithCounters.remove(itemName, itemData.remove);
            }
            
            this.setWithCounters = this.setWithCounters.merge(this.otherSetWithCounters);

            this.storeShoppingList(port);
            return null;
        }

        // Write the new file with the empty data
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`New shopping list file created at ${filePath}`);
    }
}

module.exports = ShoppingList;
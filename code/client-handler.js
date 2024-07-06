const Client = require('./models/client.js');

const PORT = process.argv[2] || 5000; // Retrieve port from command line argument

let client = new Client(PORT, null);

(async () => {
    await client.init();
})();
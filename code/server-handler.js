const Server = require('./models/server.js');

const PORT = process.argv[2] || 3000; // Retrieve port from command line argument

let server = new Server(PORT);

(async () => {
    await server.init();
})();
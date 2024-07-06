// config.js

/*import express from 'express';
import path from 'path';
import axios from 'axios';

const app = express();

// Application servers
const servers = [
    "http://localhost:3000",
    "http://localhost:3001"
]

// Track the current application server to send requests
let current = 0;

// Middleware to parse JSON requests
app.use(express.json());

// Receive new request and forward to application server
const handler = async (req, res) => {
    // Destructure properties from request object
    const { method, url, headers, body } = req;

    // Select the current server to forward the request
    const server = servers[current];

    // Update track to select the next server
    current = (current + 1) % servers.length;

    try {
        // Requesting the underlying application server
        const response = await axios({
            url: `${server}${url}`,
            method: method,
            headers: headers,
            data: body
        });

        // Send back the response data from the application server to the client
        res.send(response.data);
    } catch (err) {
        // Send back the error message 
        console.error('Error in load balancer:', err);
        res.status(500).send("Load Balancer error!");
    }
}

// Serve favicon.ico image
app.get('/favicon.ico', (req, res) => res.sendFile('/favicon.ico'));

// Route for handling all other requests
app.all('*', handler);

// Listen on PORT 8080
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Load Balancer Server listening on PORT ${PORT}`);
});
*/
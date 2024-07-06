# SDLE - Large Scale Distributed Systems 2023/24

## Local-First Shopping List Application

### Project Description
This project aims to develop a local-first shopping list application, that offers a seamless user experience with the ability to create and manage shopping lists, while ensuring data persistence and high availability. The application operates on a two-tier architecture: the user's device and a cloud component. Users can create shopping lists with a unique identifier and share these lists with others. The application allows multiple users to modify lists concurrently, and it provides features like adding/removing items and setting target quantities.

The cloud component is responsible for storing the data and ensuring its availability. The application should be able to operate in a disconnected state, and synchronize the data with the cloud component when the client wants. The cloud component should also be able to handle concurrent requests from multiple users.

---

### How to run the project
In order to run the project, you need to have Node.js installed on your machine. You can download it from [here](https://nodejs.org/en/download/).

#### Node Dependencies
The files package.json and package-lock.json specify the dependencies of the project. To install them, run the following command:

```bash
npm install
```

#### Run the project
To run the project, you need 3 terminals for 3 servers (this can be scalable as desired), 1 terminal for the router (this can also be scalable as desired, but needs code changes), and 1 terminal for each client. In the server and client commands you need to specify the port as argument. Remember to change to the directory ```/code``` of the project before running the following commands.

##### Router - 1st terminal
```bash
cd models
node router.js
```
##### Server 3001 - 2nd terminal
```bash
node server-handler.js 3001
```
##### Server 3002 - 3rd terminal
```bash
node server-handler.js 3002
```
##### Server 3003 - 4th terminal
```bash
node server-handler.js 3003
```
##### Client 1 - 5th terminal
```bash
node client-handler.js 4001
```
##### Client 2 - 6th terminal
```bash
node client-handler.js 4002
```

**Note**
The Client can be launched independently from the router and the servers. The client will try to connect to the router, and if it is not available, it will try to connect every 10 seconds. The client will also try to reconnect to the router/server if the connection is lost.

---

### Project Result and Functionality

**Video demo:**

[![Demo Video](/docs/cover.png)](/docs/demo/demo.mp4)

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require("path");
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
connectDB();

const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Serve the frontend (make sure to reference the correct path to 'frontend')
app.use(express.static(path.join(__dirname, 'frontend')));

// Socket.io
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', async ({ token, content, receiverId }) => {
        // Here you would verify the JWT token, get the sender ID, and save the message to the DB
        const senderId = "some_sender_id"; // Replace with logic to decode token
        console.log(`Message from ${senderId} to ${receiverId}: ${content}`);

        // Broadcast the message to all connected clients
        io.emit('receiveMessage', { content, senderId, receiverId });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Define routes for authentication, posts, and chat
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

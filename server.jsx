require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const server = createServer(app);


const io = new Server(server,{
    cors: {
        origin: "http://localhost:3000",
        method: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use ('/api', require('./routes/client'));
app.use('/', require('./routes/admin'));

io.on('connection', (socket) => {
    console.log(`connected ${socket.id}`);
    socket.on('send_message', (data) => {
        socket.broadcast.emit('receive_message', data)
    });
  });

  

server.listen(3001, () =>{
    console.log(`Server is running at http://localhost:3001`);
})
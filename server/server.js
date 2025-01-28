const io = require("socket.io")(process.env.PORT || 3002, {
    cors: {
    //   origin: "https://chat-reaction.vercel.app"
      origin: "http://localhost:3000",
    },
  });
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on("create-room", (callback) => {
        // Generate a random room ID (you can implement your own logic)
        const roomId = Math.random().toString(36).substring(7);
        callback(roomId);  // Send the room ID back to the client
      });
  
    socket.on('call-user', ({ offer, to }) => {
      io.to(to).emit('receive-call', { offer, from: socket.id });
    });
  
    socket.on('answer-call', ({ answer, to }) => {
      io.to(to).emit('call-answered', { answer });
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
 
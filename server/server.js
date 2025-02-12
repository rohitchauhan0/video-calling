const io = require("socket.io")(process.env.PORT || 3002, {
    cors: {
      // origin: "http://localhost:3000",
      origin: "https://video-calling-green.vercel.app",
    },
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle movie selection and broadcast it to other users
    socket.on('select-movie', (videoId) => {
        console.log(`Broadcasting selected movie: ${videoId}`);
        socket.broadcast.emit('play-movie', videoId);
    });

    // Handle play event and broadcast to all users except the sender
    socket.on('play-video', () => {
        console.log('Broadcasting play event');
        socket.broadcast.emit('play-video');
    });

    // Handle pause event and broadcast to all users except the sender
    socket.on('pause-video', () => {
        console.log('Broadcasting pause event');
        socket.broadcast.emit('pause-video');
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

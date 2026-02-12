const onlineUsers = new Map();

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connecté :", socket.id);

    // quand un user s'identifie
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log("User online :", userId);
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log("User offline :", userId);
        }
      }
    });
  });
};

export { onlineUsers };

const http = require("http");
const mysql = require("mysql");

const dbConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "near_u",
});

dbConnection.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:", err);
    return;
  }
  console.log("Conexión a la base de datos MySQL establecida");
});

const server = http.createServer();
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Se ha conectado un cliente");

  socket.broadcast.emit("chat_message", {
    usuario: "INFO",
    mensaje: "Se ha conectado un nuevo usuario",
  });

  socket.on("chat_message", (data) => {
    const { usuario, mensaje } = data;
    const insertQuery = `INSERT INTO messages (user_id, message) VALUES (?, ?)`;
    dbConnection.query(insertQuery, [usuario, mensaje], (err, result) => {
      if (err) {
        console.error("Error al insertar el mensaje en la base de datos:", err);
        return;
      }
      io.emit("chat_message", data);
    });
  });

  const selectQuery = `SELECT * FROM messages`;
  dbConnection.query(selectQuery, (err, results) => {
    if (err) {
      console.error(
        "Error al recuperar los mensajes de la base de datos:",
        err
      );
      return;
    }
    results.forEach((row) => {
      socket.emit("chat_message", {
        usuario: row.usuario,
        message: row.message,
      });
    });
  });
});

server.listen(6001);

const http = require("http");
const { Client } = require("pg");

const dbConnection = new Client({
  host: "dpg-crpga1dds78s73d9rmp0-a",
  user: "emanuel_allaria",
  password: "icekd6Hg1LRLfh2B1i8BPwSULeIaLW8k",
  database: "bd_near_u",
  port: 5432,
});

dbConnection.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:", err);
    return;
  }
  console.log("Conexión a la base de datos PostgreSQL establecida");
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
    const insertQuery = `INSERT INTO messages (user_id, message) VALUES ($1, $2)`;
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
    results.rows.forEach((row) => {
      socket.emit("chat_message", {
        usuario: row.user_id,
        message: row.message,
      });
    });
  });
});

server.listen(6001);

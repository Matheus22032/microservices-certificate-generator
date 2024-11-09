const express = require('express');
const amqp = require('amqplib');
const { Client } = require("pg");

const app = express();
app.use(express.json());

const client = new Client({
  user: "postgres",
  password: "postgres",
  host: "postgres",
  port: 5432,
  database: "certificates",
});

const RABBITMQ_URL = "amqp://guest:guest@rabbitmq:5672";
const QUEUE_NAME = "certificates";
let rabbitChannel;

const connectToPostgres = async () => {
  try {
    console.log("Tentando conectar ao PostgreSQL...");
    await client.connect();
    console.log("Conectado ao PostgreSQL!");
  } catch (error) {
    console.error("Erro ao conectar ao PostgreSQL:", error.message);
    process.exit(1); 
  }
};

const connectToRabbitMQ = async () => {
  while (!rabbitChannel) {
    try {
      console.log("Tentando conectar ao RabbitMQ...");
      const connection = await amqp.connect(RABBITMQ_URL);
      rabbitChannel = await connection.createChannel();
      await rabbitChannel.assertQueue(QUEUE_NAME, { durable: true });
      console.log("Conectado ao RabbitMQ e fila configurada");
    } catch (error) {
      console.error("Erro ao conectar ao RabbitMQ:", error);
      console.log("Tentando reconectar em 5 segundos...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

const sendToQueue = async (message) => {
  if (!rabbitChannel) {
    throw new Error("Erro na conexão com o RabbitMQ");
  }
  await rabbitChannel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

app.post("/certificates", async (req, res) => {
  const {
    nome,
    nacionalidade,
    estado,
    data_nascimento,
    documento,
    data_conclusao,
    curso,
    carga_horaria,
    data_emissao,
    nome_assinatura,
    cargo
  } = req.body;

  const query = `
    INSERT INTO certificates (nome, nacionalidade, estado, data_nascimento, documento, data_conclusao, curso, carga_horaria, data_emissao, nome_assinatura, cargo)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `;

  try {
    await client.query(query, [
      nome,
      nacionalidade,
      estado,
      data_nascimento,
      documento,
      data_conclusao,
      curso,
      carga_horaria,
      data_emissao,
      nome_assinatura,
      cargo
    ]);

    await sendToQueue(req.body);

    res.status(201).json({ message: "Certificado criado com sucesso" });
  } catch (error) {
    console.error("Erro ao criar o certificado:", error);
    res.status(500).json({ error: "Erro ao criar o certificado" });
  }
});

const startServer = async () => {
  try {
    await connectToPostgres();
    await connectToRabbitMQ();
    const PORT = 3000;
    app.listen(PORT, () => console.log(`API executando em | ${PORT}`));
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
};

startServer();

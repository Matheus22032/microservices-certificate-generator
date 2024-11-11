const express = require('express');
const amqp = require('amqplib');
const { Client } = require("pg");
const redis = require('redis');


const app = express();
app.use(express.json());

const client = new Client({
  user: "postgres",
  password: "postgres",
  host: "postgres",
  port: 5432,
  database: "certificates",
});


const redisClient = redis.createClient({
  url: 'redis://redis:6379'
});

redisClient.on('error', (err) => console.error('Erro ao conectar ao Redis:', err));
redisClient.connect().then(() => console.log('Conectado ao Redis'));


const RABBITMQ_URL = "amqp://guest:guest@rabbitmq:5672";
const QUEUE_NAME = "certificate";
let rabbitChannel;

const connectToPostgres = async () => {
  let retries = 5;
  await new Promise(res => setTimeout(res, 10000));
  while (retries > 0) {
    try {
      await client.connect();
      console.log('Conectado ao PostgreSQL!');
      return client;
    } catch (err) {
      console.log(`Falha ao conectar. Tentativas restantes: ${retries}`);
      retries--;
      await new Promise(res => setTimeout(res, 5000));
    }
  }

}

const connectToRabbitMQ = async () => {
  while (!rabbitChannel) {
    try {
      console.log("Tentando conectar ao RabbitMQ...");
      const connection = await amqp.connect(RABBITMQ_URL);
      rabbitChannel = await connection.createChannel();
      await rabbitChannel.assertQueue(QUEUE_NAME, { durable: false });
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
    RETURNING id
  `;

  try {
    const result = await client.query(query, [
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

    const certificateId = result.rows[0].id;  

    const certificateWithId = {
      ...req.body,
      certificateId
    };

    await sendToQueue(certificateWithId);

    res.status(201).json({ message: "Certificado criado com sucesso", id: certificateId });
  } catch (error) {
    console.error("Erro ao criar o certificado:", error);
    res.status(500).json({ error: "Erro ao criar o certificado" });
  }
});



app.get('/certificates', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM certificates');
    
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar certificados:", error);
    res.status(500).json({ error: "Erro ao buscar certificados" });
  }
});


app.get("/certificates/:id", async (req, res) => {
  const certificateId = req.params.id; 

  try {
    let cachedCertificate = await redisClient.get(`certificate:${certificateId}`);

    if (cachedCertificate) {
      return res.json(JSON.parse(cachedCertificate));
    }

    const result = await client.query("SELECT * FROM certificates WHERE id = $1", [certificateId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Certificado não encontrado" });
    }

    const certificate = result.rows[0];

    await redisClient.set(`certificate:${certificateId}`, JSON.stringify(certificate), { EX: 3600 });

    res.json(certificate);
  } catch (error) {
    console.error("Erro ao obter certificado:", error);
    res.status(500).json({ error: "Erro ao obter certificado" });
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

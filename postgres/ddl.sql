CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    nacionalidade VARCHAR(255) NOT NULL,
    estado VARCHAR(255) NOT NULL,
    data_nascimento VARCHAR(255) NOT NULL,
    documento VARCHAR(255) NOT NULL,
    data_conclusao VARCHAR(255) NOT NULL,
    curso VARCHAR(255) NOT NULL,
    carga_horaria VARCHAR(255) NOT NULL,
    data_emissao VARCHAR(255) NOT NULL,
    nome_assinatura VARCHAR(255) NOT NULL,
    cargo VARCHAR(255)
);
# Global Microservices
### Gustavo Henrique Omai da Silva RM96059
### Matheus Gonçalves Sant'Ana RM96166

# Como Rodar?

### Abra o terminal e digite o comando

```
  git clone https://github.com/Matheus22032/microservices-certificate-generator.git
```

### Navegue até a pasta do projeto clonado

### Abra o Docker


### Rode o comando

```
  docker compose up --build -d
```

### Caso queira escalar o Worker


```
  docker compose up --build -d --scale worker=num_de_workers_desejado
```

#### Retorna o Path do certificado

```http
  GET /localhost:3000/certificate/{id}
```

#### Criar Certificado

```http
  POST /localhost:3000/certificate
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `nome`      | `string` |  Nome no Certificado
| `nacionalidade`      | `string` |  Nacionalidade
| `estado`      | `string` |  Estado
| `data_nascimento`      | `string` |  Data de Nascimento
| `documento`      | `string` | Documento
| `data_conclusao`      | `string` | Data de conclusão
| `curso`      | `string` |  Curso concluído
| `carga_horaria`      | `string` |  Carga horária
| `data_emissao`      | `string` |  Data de emissão
| `cargo`      | `string` |  Cargo

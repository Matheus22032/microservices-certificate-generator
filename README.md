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
  GET /localhost:3000/certificate/:id

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



### Requisições CURL

#### POST

```curl
  curl --location 'http://localhost:3000/certificates' \
--header 'Content-Type: text/plain' \
--data '{ 
  "nome": "Nome",
    "nacionalidade": "Brasileira",
    "estado": "SP",
    "data_nascimento": "1990-01-01",
    "documento": "123456789",
    "data_conclusao": "2024-06-01",
    "curso": "Curso de Teste",
    "carga_horaria": "40h",
    "data_emissao": "2024-07-01",
    "nome_assinatura": "Assinatura Teste",
    "cargo": "Coordenador"
}'
```

#### GET

```curl
  curl --location 'http://localhost:3000/certificates/:id'
```

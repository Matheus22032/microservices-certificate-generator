import pika
import json


mensagem = {
    "nome": "Teste aaaaaa",
    "nacionalidade": "brasileiro",
    "estado": "São Paulo",
    "data_nascimento": "01/01/1990",
    "documento": "123456789",
    "data_conclusao": "01/12/2023",
    "curso": "Programação em Python",
    "carga_horaria": "60",
    "data_emissao": "01/11/2024",
    "nome_assinatura": "Prof. Maria da Costa",
    "cargo": "Coordenadora do Curso"
}

def enviar_mensagem(mensagem):
    mensagem_json = json.dumps(mensagem)
    

    connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
    channel = connection.channel()
    

    channel.queue_declare(queue='certificate')
    

    channel.basic_publish(exchange='', routing_key='certificate', body=mensagem_json)
    print("Mensagem enviada:", mensagem_json)
    
 
    connection.close()


enviar_mensagem(mensagem)

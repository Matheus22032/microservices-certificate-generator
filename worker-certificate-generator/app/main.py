import time
import pdfkit
from jinja2 import Environment, FileSystemLoader
import os
import pika
import json
import psycopg2
from psycopg2 import sql

host = os.getenv('DATABASE_HOST')
user = os.getenv('DATABASE_USER')
password = os.getenv('DATABASE_PASSWORD')
dbname = os.getenv('DATABASE_NAME')
env = Environment(loader=FileSystemLoader('.'))
template = env.get_template('template.html')
try:
    time.sleep(10)
    conn = psycopg2.connect(
        host=host,
        port=5432,
        user=user,
        password=password,
        dbname=dbname
    )
    print("Conexão estabelecida com sucesso!")

except Exception as e:
    print("Erro ao conectar ao PostgreSQL:", e)

def update_column( certificate_path, certificate_id):
    cursor = conn.cursor()

    sql = f"UPDATE certificates SET certificate_path = %s WHERE id = %s"
    
    try:
        cursor.execute(sql, (certificate_path, certificate_id))
        conn.commit()
        print(f"Registro com ID {certificate_id} atualizado com sucesso.")
    except Exception as e:
        print(f"Erro ao atualizar o registro: {e}")
        conn.rollback()
    finally:
        cursor.close()

def name_pdf_formater(name):
    words = name.split()
    first_name = words[0]
    last_name = words[-1]
    return f"{first_name}_{last_name}.pdf"

def consume_message(ch, method, properties, body):
    data = json.loads(body)
    print(f"Dados recebidos: {data}")

    try:
        html_content = template.render(data)
        print("Conteúdo HTML renderizado com sucesso!")

        pdf_dir = 'pdf_files'
        os.makedirs(pdf_dir, exist_ok=True)
        pdf_name = name_pdf_formater(data['nome'])
        pdf_path = os.path.join(pdf_dir, pdf_name)

        pdfkit.from_string(html_content, pdf_path)
        update_column(pdf_path, data['certificateId'])
        print(f"Certificado para {data['nome']} gerado com sucesso!")
        
    except Exception as e:
        print(f"Erro ao gerar o PDF: {e}")

    ch.basic_ack(delivery_tag=method.delivery_tag)

def worker_init():
    max_retries = 5
    retries = 0
    while retries < max_retries:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
            channel = connection.channel()
            channel.queue_declare(queue='certificate')
            channel.basic_consume(queue='certificate', on_message_callback=consume_message)
            print('Worker iniciado. Aguardando mensagens...')
            channel.start_consuming()
            break
        except pika.exceptions.AMQPConnectionError:
            retries += 1
            print(f"Erro de conexão com o RabbitMQ. Retentando em 5 segundos... ({retries}/{max_retries})")
            time.sleep(5)

worker_init()

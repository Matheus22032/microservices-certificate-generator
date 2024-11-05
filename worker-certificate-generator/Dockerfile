FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y \
    wkhtmltopdf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./app/ .

COPY ./requirements.txt .

RUN pip install -r requirements.txt

CMD ["python", "main.py"]

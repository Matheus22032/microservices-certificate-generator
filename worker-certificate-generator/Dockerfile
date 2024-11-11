FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y \
    wkhtmltopdf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /tmp/runtime-root && \
    chmod 700 /tmp/runtime-root

ENV XDG_RUNTIME_DIR=/tmp/runtime-root

WORKDIR /app

COPY ./app/ .

ENV PYTHONUNBUFFERED=1

COPY ./requirements.txt .

RUN pip install -r requirements.txt

CMD ["python", "main.py"]

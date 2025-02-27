FROM python:3.10-slim

WORKDIR /app
COPY my_shared_models my_shared_models
COPY requirements.txt .

ENV PYTHONPATH="/app:/app/..:$PYTHONPATH"

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -e my_shared_models
RUN apt-get update && apt-get install -y curl

COPY . .

RUN chmod +x ./oauth2/migration.sh

CMD ["/bin/bash", "./oauth2/migration.sh"]

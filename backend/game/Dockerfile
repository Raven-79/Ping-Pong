FROM python:3.10-slim

WORKDIR /app

COPY . .

ENV PYTHONPATH="/app:/app/..:/managing/:$PYTHONPATH"

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -e my_shared_models

RUN chmod +x ./game/migration.sh

CMD ["/bin/bash", "./game/migration.sh"]
# puush

#cknckjncl

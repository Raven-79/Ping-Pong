FROM  node:18

# RUN apt-get update && apt-get install -y 
# RUN apt-get install nginx -y
# RUN apt-get install openssl -y

RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    lsb-release \
    ca-certificates \
    nginx \
    openssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -subj "/C=MO/L=BG/CN=transcendence.42.fr" \
    -keyout /etc/ssl/private/new-nginx-k.key \
    -out /etc/ssl/certs/new-nginx-c.crt;

COPY    nginx.conf /etc/nginx/sites-enabled/default
COPY start.sh /start.sh

CMD     ["bash", "/start.sh"]
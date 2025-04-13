FROM node:22

ARG WS_PORT=8001
# SOAP_HOST=172.22.35.35

# Message Queue
ARG MQ_HOST=mq
ARG MQ_VHOST=psap2
ARG USER=
ARG PASS=
ARG CREDS=$USER:$PASS


WORKDIR /srv/www/

COPY . ./

RUN npm install
RUN echo "WS_PORT=$WS_PORT" > .env
RUN echo "MQ_HOST=$MQ_HOST" >> .env
RUN echo "MQ_VHOST=$MQ_VHOST" >> .env
RUN echo "MQ_CREDENTIALS=$CREDS" >> .env



# Expose container port 5000
EXPOSE $WS_PORT

CMD ["node", "server.js"]

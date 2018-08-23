FROM node:alpine
ADD . /bot
RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh
WORKDIR /bot
RUN npm install && \
    npm run bootstrap && \
    npm run build
ENV PORT=80
EXPOSE 80
WORKDIR /bot/packages/bot
ENTRYPOINT node .

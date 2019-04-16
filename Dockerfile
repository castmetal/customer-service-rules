FROM node:8.11.4

WORKDIR /usr/src/app

ARG NODE_ENV  

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD npm start
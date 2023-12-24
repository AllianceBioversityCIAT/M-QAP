FROM node:18

WORKDIR /back-end

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "run", "build-and-start" ]

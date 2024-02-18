FROM docker.io/node:20-bookworm

COPY . .

WORKDIR /back-end

RUN npm install

CMD [ "npm", "run", "build-and-start" ]
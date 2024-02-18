FROM docker.io/node:20-bookworm
RUN npm --version \
    && npm install -g @angular/cli@16 \
    && rm -rf ~/.npm

RUN mkdir /front-end
COPY src /front-end/src
COPY package.json *.json /front-end/
WORKDIR /front-end

RUN npm i --force
RUN npm run build

FROM docker.io/nginx:stable
COPY --from=0 /front-end/dist /front-end/dist
COPY nginxConf/default.conf /etc/nginx/conf.d/default.conf

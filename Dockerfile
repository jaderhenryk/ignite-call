FROM node:18

WORKDIR /ignite-call
COPY . .

RUN npm install
RUN npm run build
CMD [ "npm", "start" ]
EXPOSE 3000
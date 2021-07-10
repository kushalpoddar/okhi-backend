#Import nodejs image
FROM node:erbium

WORKDIR /app

RUN mkdir ./uploads
 
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3498

CMD ["npm", "start"]
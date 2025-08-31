FROM node:22
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8000
ENV DEBUG=backend:*
CMD ["npm", "start"]
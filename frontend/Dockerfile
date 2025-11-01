FROM node:23-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
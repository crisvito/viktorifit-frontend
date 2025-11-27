# FROM node:24
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "5173"]

# Stage 1: build Angular app
FROM node:24 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: serve dengan Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/viktorifit-frontend .
CMD ["nginx", "-g", "daemon off;"]

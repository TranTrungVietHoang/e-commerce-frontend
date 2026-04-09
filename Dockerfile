# Stage 1: Cài đặt thư viện và Build dự án Vite ra file tĩnh
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Cài Nginx để phục vụ file tĩnh
FROM nginx:alpine
# Xóa cấu hình mặc định đi kèm với nginx
RUN rm -rf /usr/share/nginx/html/*
# Copy các file đã build bên Stage 1 sang thư mục html của nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy file cấu hình điều hướng Nginx tùy chỉnh vào
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80 cho web
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
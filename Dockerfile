# Sử dụng Node.js làm base image
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ project vào container
COPY . .

# Mở cổng 5173
EXPOSE 5173

# Chạy Vite Dev Server
CMD ["npm", "run", "dev", "--", "--host"]

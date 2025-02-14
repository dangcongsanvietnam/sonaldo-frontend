# Sử dụng Nginx làm server
FROM nginx:alpine

# Copy file build từ Vite (dist) vào Nginx
COPY dist /usr/share/nginx/html

# Expose port 80 để truy cập từ bên ngoài
EXPOSE 5173

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]

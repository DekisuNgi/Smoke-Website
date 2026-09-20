FROM nginx:alpine

# ก๊อปปี้โฟลเดอร์ dist จากเครื่องเข้า Directory ของ Nginx
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
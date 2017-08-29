# vue-webrtc

> A Vue.js project about video communication

## 演示地址

- https://laravue.xyz

## 项目概述

- 实现通过拨号方式建立点对点视频通话连接

## 安装

- git clone
- npm i
- npm run dev  // 本地测试
- npm run build  // 线上环境；
- node server.js

## Nginx 反向代理

线上环境修改 Room.vue 中的 const socket = io.connect('https://yourdomain');

如果部署到线上环境，可以配置 Nginx 反向代理，并且配置 SSL 证书（WebRTC 必须要使用安全协议，如：https & wss）
如下所示：

```
server {
        listen 443 ssl;

        ssl_certificate '你的 SSL 证书地址';
        ssl_certificate_key '你的 SSL 证书地址';
        
        ssl_session_cache shared:SSL:50m;
        ssl_session_timeout 1d;
        ssl_session_tickets off;

        server_name '你的域名';
        
        if ($scheme = http) {
                return 301 https://$server_name$request_uri;
        }

        location / {
                proxy_pass    http://127.0.0.1:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header Host $host;
        }
}
```

## 说明

- 关键是两个文件：server.js 为消息分发的信令服务; 客户端首页面在 src/view/Room.vue
- 如有任何疑问或者 bug，欢迎联系 `root@laravue.org`

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

# p2p-webrtc

> A Vue.js project about video communication

## 演示地址

- https://webrtc.laravue.org

## 项目概述

- 实现通过拨号方式建立点对点视频通话连接
- 详情请参考 [https://laravue.org/#/articles/22](https://laravue.org/#/articles/22)

## 安装

- git clone
- npm i
- npm run build
- node server.js

## 本地部署

- 安装完之后，chrome 或者 firefox 浏览器访问 `localhost:3000`

## 线上部署

- **Nginx 反向代理**

线上环境修改 `Room.vue` 中的 `const socket = io.connect('https://yourdomain');`

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

        location / {
                proxy_pass    http://127.0.0.1:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header Host $host;
        }
}
```

- **pm2 or forever 守护进程**

```
npm i -g pm2
pm2 start server.js

OR
npm i -g forever
forever start server.js
```

## 说明

- 线上部署需要先部署 stun 服务器，否则不同域之间不能通信
- 如有任何疑问或者 bug，欢迎联系 `root@laravue.org` 或者 `247281377@qq.com`

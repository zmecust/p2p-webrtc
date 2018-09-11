# vue-webrtc

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

- **Supervisor 守护进程**

node 服务由 Supervisor 启动并维护，设置参数如下：

```
[program:WebRTC]
process_name=%(program_name)s
command=node /var/www/html/p2p-webrtc/server.js --daemon  # node 服务所在地址
autostart=true
autorestart=true
user=root
numprocs=1
redirect_stderr=false
stdout_logfile=/var/log/supervisor/WebRTC.log
```
如果启动失败，可能需要执行：`unlink /run/supervisor.sock`

对应的需要修改 server.js 的 `app.use(express.static('/var/www/html/p2p-webrtc/dist'));` //客户端所在地址，修改成绝对路径，否则会报 404 错误

- supervisord -c /etc/supervisor/supervisord.conf //起服务，注意 supervisor 配置文件所在目录
- supervisord shutdown //关闭服务 
- supervisord reload //重启服务 

## 说明

- 线上部署需要先部署 stun 服务器，否则不同域之间不能通信
- 如有任何疑问或者 bug，欢迎联系 `root@laravue.org` 或者 `247281377@qq.com`

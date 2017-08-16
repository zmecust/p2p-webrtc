# vue-webrtc

> A Vue.js project about video communication

## 演示地址

- https://laravue.xyz

## 项目概述

- 实现通过拨号方式建立点对点视频通话连接

## 安装

- git clone
- npm i
- 如果只是本地测试，则修改 server.js 为 http 方式；线上环境需要自己配置 ssl 证书；
- node server.js

## 说明

- 关键是两个文件：server.js 为消息分发的信令服务，首页面在 src/view/Room.vue

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

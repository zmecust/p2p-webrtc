import Vue from 'vue'
import Router from 'vue-router'
import Room from '../views/Room'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'room',
      component: Room
    },
  ]
})
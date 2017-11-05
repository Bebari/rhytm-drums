import Vue from 'vue'
import Router from 'vue-router'
import VueResource from 'vue-resource'
import DrumGrid from '@/components/DrumGrid'

Vue.use(Router)
Vue.use(VueResource);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'DrumGrid',
      component: DrumGrid
    }
  ]
})

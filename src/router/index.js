import Vue from 'vue'
import Router from 'vue-router'
import DrumGrid from '@/components/DrumGrid'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'DrumGrid',
      component: DrumGrid
    }
  ]
})

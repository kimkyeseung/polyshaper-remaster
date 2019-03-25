import Vue from 'vue';
import Router, { Route } from 'vue-router';

const uploadPage = () => import(/* webpackChunkName: "Upload" */ '@/pages/upload/index.vue');
const polyEditPage = () => import(/* webpackChunkName: "PolyEdit" */ '@/pages/poly-edit/index.vue');


Vue.use(Router);

const router: Router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/upload',
    },
    {
      path: '/upload',
      name: 'upload',
      component: uploadPage,
    },
    {
      path: '/poly-edit/:image',
      name: 'poly-edit',
      component: polyEditPage,
    },
  ],
});


router.beforeEach((to: Route, from: Route, next: Function) => {

  console.log(to, 'to');
  console.log(from, 'from')
  return next();

});

export default router

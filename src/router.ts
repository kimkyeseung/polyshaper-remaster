import Vue from 'vue';
import Router from 'vue-router';

const uploadPage = () => import(/* webpackChunkName: "Upload" */ '@/pages/upload/index.vue');
const polyEditPage = () => import(/* webpackChunkName: "PolyEdit" */ '@/pages/poly-edit/index.vue');


Vue.use(Router);

export default new Router({
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

import Vue from 'vue';
import Router from 'vue-router';
import Upload from '@/pages/upload/index.vue';
// import Upload2 from '@/pages/upload2/index.vue';
import Test from '@/pages/test/index.vue';

const uploadPage = () => import(/* webpackChunkName: "Upload" */ '@/pages/upload/index.vue');
// const uploadPage = () => import(/* webpackChunkName: "Upload" */ '@/pages/upload2/index.vue');

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/upload'
    },
    {
      path: '/upload',
      name: 'upload',
      component: uploadPage,
    },
    {
      path: '/test',
      component: Test
    }
  ],
});

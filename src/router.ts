import Vue from 'vue';
import Router from 'vue-router';
import Upload from '@/pages/upload/index.vue';
// import Upload2 from '@/pages/upload2/index.vue';

// const uploadPage = () => import(/* webpackChunkName: "Upload" */ '@/pages/upload/index.vue');
const uploadPage = () => import(/* webpackChunkName: "Upload" */ '@/pages/upload2/index.vue');

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      // redirect: '/upload',
      component: uploadPage
    },
    // {
    //   path: '/upload',
    //   name: 'upload',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: Upload,
    // },
  ],
});

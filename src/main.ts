import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/index';
import canvasHelper from './helpers/canvasHelper';

import '@/styles/style.scss';

import VueSVGIcon from 'vue-svgicon';

Vue.config.productionTip = false;
Vue.use(VueSVGIcon);
Vue.use(canvasHelper);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

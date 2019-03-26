import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/index';
import canvasHelper from './helpers/canvasHelper';
import utilityHelper from './helpers/utilityHelper';

import '@/styles/style.scss';

import VueSVGIcon from 'vue-svgicon';

Vue.config.productionTip = false;
Vue.use(VueSVGIcon);
Vue.use(canvasHelper);
Vue.use(utilityHelper);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

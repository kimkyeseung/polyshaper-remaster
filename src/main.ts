import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/index';
import canvasHelper from './helpers/canvasHelper';
import utilityHelper from './helpers/utilityHelper';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import '@/styles/style.scss';

import VueSVGIcon from 'vue-svgicon';
import BootstrapVue from 'bootstrap-vue';
import icon from 'vue-icon'

Vue.config.productionTip = false;
Vue.use(VueSVGIcon);
Vue.use(BootstrapVue);
Vue.use(canvasHelper);
Vue.use(utilityHelper);
Vue.use(icon, 'v-icon');

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

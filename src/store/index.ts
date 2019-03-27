import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

const store = new Vuex.Store({
  plugins: [createPersistedState({
    key: 'poly',
    paths: ['imageStore'],
    // getState(key, storage) {
    //   console.log('--> ', JSON.parse(storage[key]).imageStore.image);
    //   return JSON.parse(storage[key]).imageStore.image;
    // }
    // reducer(state, paths) {
    //   console.log(state);
    //   console.log(state[paths[0]]);
    //   return {
    //     image: state[paths[0]].image
    //   };
    // }
  })],
});

export default store;

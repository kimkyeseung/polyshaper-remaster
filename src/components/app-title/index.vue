<template>
  <div :class="`app-title ${className}`">
    <h1 class="app-title__main">{{appTitle.main}}</h1>
    <p class="app-title__sub">{{appTitle.sub}}</p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { TitleModel } from '@/models/interfaces';
import uiStore from '@/store/uiStore';

@Component
export default class AppTitle extends Vue {
  @Prop(String) className !: string;

  get appTitle(): TitleModel {
    return uiStore.title;
  }
}

</script>

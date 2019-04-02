<template>
  <div class="controller">
    <app-title className="controller__title"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { AppTitle } from '@/components';

@Component({ components: { AppTitle } })
export default class Controller extends Vue {
}
</script>

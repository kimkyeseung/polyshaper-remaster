<template>
  <div class="display">
    <h1>display</h1>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Display extends Vue {
  test(ev) {
    console.log('work', ev);
  }
}

</script>

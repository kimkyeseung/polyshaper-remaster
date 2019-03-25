<template>
  <form>
    <h1>why?</h1>
    <div>
      <input type="file" name="2" id="1" @change="test">
    </div>
  </form>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Test extends Vue {
  test(ev) {
    console.log('work', ev);
  }
}

</script>

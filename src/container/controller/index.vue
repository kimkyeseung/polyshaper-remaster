<template>
  <div class="controller">
    <app-title className="controller__title"/>
    <section>
      <b-button @click="handleImageReset">Image Reset</b-button>
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ImageStore from '@/store/imageStore';
import { AppTitle } from '@/components';
import polyStore from '@/store/polyStore';

@Component({ components: { AppTitle } })
export default class Controller extends Vue {
  handleImageReset() {
    ImageStore.uploadImage();
    polyStore.initialize();
  }
}
</script>

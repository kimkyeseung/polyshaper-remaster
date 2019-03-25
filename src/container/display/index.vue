<template>
  <div class="display">
    <img :src="uploadedImage" alt="user uploaded image">
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ImageStore from '@/store/imageStoreModule';

@Component
export default class Display extends Vue {
  get uploadedImage() {
    return ImageStore.image;
  }
}

</script>

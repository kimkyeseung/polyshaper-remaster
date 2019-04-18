<template>
  <div class="controller">
    <app-title className="controller__title"/>

    <section v-if="selectedFace">
      <form>
        <input type="color" name="" id="" v-model="selectedFace.color">
        <p>{{selectedFace.color}}</p>
      </form>
      <b-button>Deselect</b-button>
    </section>
    <section>
      <b-button @click="handleImageReset">Image Reset</b-button>
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ImageStore from '@/store/imageStore';
import PolyStore from '@/store/polyStore';
import { AppTitle } from '@/components';
import { Face } from '@/models/interfaces';

@Component({ components: { AppTitle } })
export default class Controller extends Vue {
  public color = 'rgb(255, 0, 0)';

  get selectedFace() {
    return PolyStore.selectedFace;
  }

  handleImageReset() {
    ImageStore.uploadImage();
    PolyStore.initialize();
  }
}
</script>

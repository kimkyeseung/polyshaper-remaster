<template>
  <div class="controller">
    <app-title className="controller__title"/>

    <section v-if="selectedFace">
      <form>
        <input type="color" name="" id="" :value="$hexColorFormatter(selectedFace.color)" @change="handleColorChange">
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
import { Vue, Component, Mixins } from 'vue-property-decorator';
import ImageStore from '@/store/imageStore';
import PolyStore from '@/store/polyStore';
import { AppTitle } from '@/components';
import { Face } from '@/models/interfaces';
import canvasStore from '../../store/canvasStore';

@Component({ components: { AppTitle } })
export default class Controller extends Vue {
  public color = Vue.prototype.$hexColorFormatter('rgb(255, 255, 255)');

  get selectedFace(): Face {
    return PolyStore.selectedFace;
  }

  set selectedFace(color) { // not work yet
    PolyStore.changeFaceColor(color);
  }

  handleColorChange({target}: {target: HTMLInputElement}) {
    const color = Vue.prototype.$rgbColorFormatter(target.value);
    PolyStore.changeFaceColor(color);
    Vue.prototype.$makeFaceOnCanvas(this.selectedFace, canvasStore.polyCanvas);
  }

  handleImageReset() {
    ImageStore.uploadImage();
    PolyStore.initialize();
  }
}
</script>

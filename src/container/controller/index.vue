<template>
  <div class="controller">
    <app-title className="controller__title"/>

    <section v-if="selectedFace" class="controller__section">
      <fieldset>
        <legend class="controller__section_selected-face">Selected Face</legend>
        <div class="input_wrap">
          <input type="color"
            :value="$hexColorFormatter(selectedFace.color)"
            @change="handleColorChange"
          />
        </div>
        <div class="text_wrap">
          <p>{{$hexColorFormatter(selectedFace.color)}}</p>
          <p>{{selectedFace.color}}</p>
        </div>
        <b-button class="button">Deselect</b-button>
        <b-button class="button">Get Color from Image</b-button>
        <b-button class="button danger">Delete Face</b-button>
      </fieldset>
    </section>
    <section class="controller__section">
      <b-button class="button" @click="handleImageReset">Image Reset</b-button>
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

  handleColorChange({target}: {target: HTMLInputElement}) {
    const color = Vue.prototype.$rgbColorFormatter(target.value);
    PolyStore.changeFaceColor(color);
    Vue.prototype.$makeFaceOnCanvas(this.selectedFace, canvasStore.polyCanvas);
  }

  handleDeselectFace() {
    //
  }

  handleImageReset() {
    ImageStore.uploadImage();
    PolyStore.initialize();
  }
}
</script>

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
        <b-button class="button" @click="handleDeselectFace">Deselect</b-button>
        <b-button class="button">Get Color from Image</b-button>
        <b-button class="button danger" @click="handleDelete">Delete Face</b-button>
      </fieldset>
    </section>

    <section class="controller__section">
      <fieldset>
        <legend class="controller__section_background">Background</legend>
        <b-form-checkbox v-model="backgroundVisible" switch>Background Image</b-form-checkbox>
      </fieldset>
    </section>

    <section class="controller__section">
      <b-button class="button" @click="handleImageReset">Image Reset</b-button>
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import ImageStore from '@/store/imageStore';
import PolyStore from '@/store/polyStore';
import { AppTitle } from '@/components';
import { Face } from '@/models/interfaces';
import canvasStore from '../../store/canvasStore';
import polyStore from '@/store/polyStore';

@Component({ components: { AppTitle } })
export default class Controller extends Vue {
  public color = Vue.prototype.$hexColorFormatter('rgb(255, 255, 255)');

  get selectedFace(): Face {
    return PolyStore.selectedFace;
  }

  get backgroundVisible(): boolean {
    return PolyStore.backgroundVisible;
  }

  set backgroundVisible(value: boolean) {
    PolyStore.toggleBackgroundVisible(value);
  }

  handleColorChange({ target }: {target: HTMLInputElement}) {
    const color = Vue.prototype.$rgbColorFormatter(target.value);
    PolyStore.changeFaceColor(color);
    Vue.prototype.$makeFaceOnCanvas(this.selectedFace, canvasStore.polyCanvas);
  }

  handleDeselectFace() {
    PolyStore.deselectFace();
    Vue.prototype.$clearCanvas(canvasStore.selectedFace);
    Vue.prototype.$clearCanvas(canvasStore.guideCanvas);
  }

  handleDeleteFace() {
    if (!this.selectedFace) {
      return;
    }
    PolyStore.removeFace(this.selectedFace);
    this.handleDeselectFace();
    Vue.prototype.$drawAllFaces(canvasStore.polyCanvas, polyStore.faces);
  }

  handleImageReset() {
    ImageStore.uploadImage();
    PolyStore.initialize();
  }

  handleEscape() {
    this.handleDeselectFace();
  }

  handleDelete() {
    this.handleDeleteFace();
  }

  handleKeyup({ key }: KeyboardEvent) {
    switch (key) {
      case 'Escape':
        this.handleEscape();
        return;
      case 'Delete':
        this.handleDelete();
        return;
      default:
        return;
    }
  }

  @Watch('backgroundVisible')
  onBackgroundVisibleChanged(value: boolean) {
    // value ? 
  }

  created() {
    window.addEventListener('keyup', this.handleKeyup);
  }

  beforeDestroy() {
    window.removeEventListener('keyup', this.handleKeyup);
  }
}
</script>

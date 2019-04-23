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
        <label for="opacity" v-if="backgroundVisible">
          Opacity: {{backgroundOpacity}}
          <input
            type="range"
            name="opacity"
            id="opacity"
            min="0.1"
            max="1"
            step="0.1"
            :value="backgroundOpacity"
            @change="handleOpacityChange">
        </label>
        <label for="backgroundColor">
          Fill Background
          <div class="input_wrap">
            <input
              id="backgroundColor"
              type="color"
              value="black"
              ref="backgroundColor"
              @change="handleSelectBackgroundColor"
            />
          </div>
        </label>
      </fieldset>
    </section>

    <section class="controller__section">
      <b-button class="button" @click="handleImageReset">Image Reset</b-button>
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import imageStore from '@/store/imageStore';
import { AppTitle } from '@/components';
import { Face } from '@/models/interfaces';
import canvasStore from '../../store/canvasStore';
import polyStore from '@/store/polyStore';

@Component({ components: { AppTitle } })
export default class Controller extends Vue {
  public color = Vue.prototype.$hexColorFormatter('rgb(255, 255, 255)');

  public backgroundOpacity: number = 1;

  public $refs!: {
    backgroundColor: HTMLInputElement;
  }

  get selectedFace(): Face {
    return polyStore.selectedFace;
  }

  get backgroundVisible(): boolean {
    return polyStore.backgroundVisible;
  }

  set backgroundVisible(value: boolean) {
    polyStore.toggleBackgroundVisible(value);
  }

  handleColorChange({ target }: {target: HTMLInputElement}) {
    const color = Vue.prototype.$rgbColorFormatter(target.value);
    polyStore.changeFaceColor(color);
    Vue.prototype.$makeFaceOnCanvas(this.selectedFace, canvasStore.polyCanvas);
  }

  handleOpacityChange({ target }: {target: HTMLInputElement}) {
    this.backgroundOpacity = Number(target.value);
    Vue.prototype.$fillBackgroundColor(this.$refs.backgroundColor.value, canvasStore.backgroundCanvas);
    Vue.prototype.$drawBackgroundImage(undefined, canvasStore.backgroundCanvas, this.backgroundOpacity);
  }

  handleSelectBackgroundColor({ target }: {target: HTMLInputElement}) {
    const color = Vue.prototype.$rgbColorFormatter(target.value);
    Vue.prototype.$clearCanvas(canvasStore.backgroundCanvas);
    Vue.prototype.$fillBackgroundColor(color, canvasStore.backgroundCanvas);
    Vue.prototype.$drawBackgroundImage(undefined, canvasStore.backgroundCanvas, this.backgroundOpacity);
  }

  handleDeselectFace() {
    polyStore.deselectFace();
    Vue.prototype.$clearCanvas(canvasStore.selectedFace);
    Vue.prototype.$clearCanvas(canvasStore.guideCanvas);
  }

  handleDeleteFace() {
    if (!this.selectedFace) {
      return;
    }
    polyStore.removeFace(this.selectedFace);
    this.handleDeselectFace();
    Vue.prototype.$drawAllFaces(canvasStore.polyCanvas, polyStore.faces);
  }

  handleImageReset() {
    imageStore.uploadImage();
    polyStore.initialize();
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
    // value
    //   ? Vue.prototype.$drawBackgroundImage(undefined, canvasStore.backgroundCanvas, this.backgroundOpacity)
    //   : Vue.prototype.$fillBackgroundColor(this.$refs.backgroundColor.value, canvasStore.backgroundCanvas);
    if (value) {
      Vue.prototype.$drawBackgroundImage(undefined, canvasStore.backgroundCanvas, this.backgroundOpacity);
    } else {
      Vue.prototype.$clearCanvas(canvasStore.backgroundCanvas);
      Vue.prototype.$fillBackgroundColor(this.$refs.backgroundColor.value, canvasStore.backgroundCanvas);
    }
  }

  created() {
    window.addEventListener('keyup', this.handleKeyup);
  }

  beforeDestroy() {
    window.removeEventListener('keyup', this.handleKeyup);
  }
}
</script>

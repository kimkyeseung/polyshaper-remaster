<template>
  <div class="controller" @change="handleInputChange">
    <div v-if="loading">loading~~~~~~</div>
    <app-title className="controller__title"/>

    <section class="controller__section">
      <fieldset>
        <legend class="controller__section_background">Background</legend>
        <label for="backgroundVisible">
          Background Image
          <div class="backgroundVisible-wrap">
            <input
              type="checkbox"
              v-model="backgroundVisible"
              id="backgroundVisible"
              class="backgroundVisible switch"
            />
            <span class="switch-slider"></span>
          </div>
        </label>
        <label for="opacity" v-if="backgroundVisible">
          <p>Opacity: <span>{{backgroundOpacity}}</span></p>
          <input
            type="range"
            name="opacity"
            id="opacity"
            min="0.1"
            max="1"
            step="0.1"
            :value="backgroundOpacity"
          />
        </label>
        <label for="backgroundColor">
          <p class="input_color-text">Fill Background Color</p>
          <div class="input_wrap">
            <v-icon name="edit"></v-icon>
            <input
              id="backgroundColor"
              type="color"
              value="black"
              ref="backgroundColor"
              name="backgroundColor"
            />
          </div>
        </label>
      </fieldset>
    </section>

    <section  v-if="selectedFace" class="controller__section">
      <fieldset>
        <legend>Selected Face</legend>
        <label class="controller__section_selected-face">
          <div class="input_wrap">
            <v-icon name="edit"></v-icon>
            <input
              type="color"
              :value="$hexColorFormatter(selectedFace.color)"
              name="selectedFaceColor"
              id="selectedFaceColor"
            />
          </div>
          <p>{{$hexColorFormatter(selectedFace.color)}}</p>
          <p>{{selectedFace.color}}</p>
        </label>
        <b-button class="button" @click="handleDeselectFace">Deselect</b-button>
        <b-button class="button">Get Color from Image</b-button>
        <b-button class="button danger" @click="handleDelete">Delete Face</b-button>
      </fieldset>
    </section>

    <section class="controller__section">
      <fieldset>
        <legend class="controller__section_auto-populate">Auto Populate</legend>
        <label for="variance">
          <p>Variance <span>{{variance}}</span></p>
          <input
            type="range"
            id="variance"
            name="variance"
            step="0.01"
            min="0"
            max="1"
          />
        </label>
        <label for="cellsize">
          <p>Cellsize <span>{{cellsize}}</span></p>

          <input
            type="range"
            id="cellsize"
            name="cellsize"
            step="2"
            min="20"
            max="200"
          />
        </label>
        <b-button class="button" @click="handleAutoPopulate">Auto Populate</b-button>
      </fieldset>
    </section>

    <section class="controller__section">
      <fieldset>
        <legend class="controller__section_image">Image</legend>
        <b-button class="button" @click="handleImageReset">Image Reset</b-button>
        <b-button class="button" @click="handleDownloadClick">Download Image</b-button>
      </fieldset>
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import imageStore from '@/store/imageStore';
import { AppTitle } from '@/components';
import { Face, Vertex, ColorData } from '@/models/interfaces';
import canvasStore from '../../store/canvasStore';
import polyStore from '@/store/polyStore';

@Component({ components: { AppTitle } })
export default class Controller extends Vue {
  public color = Vue.prototype.$hexColorFormatter('rgb(255, 255, 255)');

  public backgroundOpacity: number = 1;

  public $refs!: {
    backgroundColor: HTMLInputElement;
  }

  public loading: boolean = false;

  get selectedFace(): Face {
    return polyStore.selectedFace;
  }

  get backgroundVisible(): boolean {
    return polyStore.backgroundVisible;
  }

  set backgroundVisible(value: boolean) {
    polyStore.toggleBackgroundVisible(value);
  }

  get variance(): number {
    return polyStore.backgroundVariance;
  }

  get cellsize(): number {
    return polyStore.backgroundCellSize;
  }

  handleColorChange(value: string) {
    const color = Vue.prototype.$rgbColorFormatter(value);
    polyStore.changeFaceColor(color);
    Vue.prototype.$makeFaceOnCanvas(this.selectedFace, canvasStore.polyCanvas);
  }

  handleOpacityChange(value: string) {
    this.backgroundOpacity = Number(value);
    Vue.prototype.$fillBackgroundColor(this.$refs.backgroundColor.value, canvasStore.backgroundCanvas);
    Vue.prototype.$drawBackgroundImage(undefined, canvasStore.backgroundCanvas, this.backgroundOpacity);
  }

  handleSelectBackgroundColor(value: string) {
    const color = Vue.prototype.$rgbColorFormatter(value);
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

      default:
    }
  }

  handleAutoPopulate() {
    polyStore.initPoly();
    const {
      vertices,
      maxCols,
      maxRows,
      backgroundVariance,
      backgroundCellSize,
    } = polyStore;
    const backgroundNodes = Vue.prototype.$autoPopulate({ maxCols, maxRows }, backgroundVariance, backgroundCellSize);

    function populate(v1: Vertex, v2: Vertex, v3: Vertex) {
      v1.next.push(v2, v3);
      v2.next.push(v1, v3);
      v3.next.push(v1, v2);
      polyStore.addVertex(v1);
      polyStore.addVertex(v2);
      polyStore.addVertex(v3);
      const color: ColorData = Vue.prototype.$getColorAverage([v1, v2, v3], canvasStore.imageCopy, canvasStore.backgroundCanvas);
      const newFace: Face = {
        faceId: polyStore.faces.length || 0,
        color: Vue.prototype.$stringifyColorData(color),
        vertices: [v1, v2, v3],
      };
      polyStore.addFace(newFace);
      Vue.prototype.$makeFaceOnCanvas(newFace, canvasStore.polyCanvas);
    }

    for (let i = 0; i < backgroundNodes.length; i++) {
      if (backgroundNodes[i].row % 2 === 0 && backgroundNodes[i + maxCols + 1] && backgroundNodes[i].col < maxCols - 1) {
        const v1: Vertex = { ...this.snapChecker(backgroundNodes[i]), next: [] };
        const v2: Vertex = { ...this.snapChecker(backgroundNodes[i + maxCols]), next: [] };
        const v3: Vertex = { ...this.snapChecker(backgroundNodes[i + maxCols + 1]), next: [] };
        populate(v1, v2, v3);

        const v4: Vertex = { ...this.snapChecker(backgroundNodes[i]), next: [] };
        const v5: Vertex = { ...this.snapChecker(backgroundNodes[i + 1]), next: [] };
        const v6: Vertex = { ...this.snapChecker(backgroundNodes[i + maxCols + 1]), next: [] };
        populate(v4, v5, v6);
      } else if (backgroundNodes[i - 1] && backgroundNodes[i + maxCols] && backgroundNodes[i].col > 0) {
        const v7: Vertex = { ...this.snapChecker(backgroundNodes[i]), next: [] };
        const v8: Vertex = { ...this.snapChecker(backgroundNodes[i - 1]), next: [] };
        const v9: Vertex = { ...this.snapChecker(backgroundNodes[i + maxCols - 1]), next: [] };
        populate(v7, v8, v9);

        const v10: Vertex = { ...this.snapChecker(backgroundNodes[i]), next: [] };
        const v11: Vertex = { ...this.snapChecker(backgroundNodes[i + maxCols]), next: [] };
        const v12: Vertex = { ...this.snapChecker(backgroundNodes[i + maxCols - 1]), next: [] };
        populate(v10, v11, v12);
      }
    }
  }

  snapChecker(vertex: Vertex): Vertex {
    const snap: Vertex = polyStore.vertices.getSnapPoint(vertex);
    if (snap) {
      vertex.x = snap.x;
      vertex.y = snap.y;
    }
    return vertex;
  }

  handleInputChange({ target }: { target: HTMLInputElement }) {
    const { value, name }: { value: string, name: string } = target;
    switch (name) {
      case 'opacity':
        this.handleOpacityChange(value);
        return;
      case 'backgroundColor':
        this.handleSelectBackgroundColor(value);
        return;
      case 'selectedFaceColor':
        this.handleColorChange(value);
        return;
      case 'variance':
        polyStore.setVariance(value);
        polyStore.setMaximum({
          maxCols: Math.ceil(((canvasStore.canvasSize.width + polyStore.backgroundCellSize * 2) / polyStore.backgroundCellSize) + 2),
          maxRows: Math.ceil((canvasStore.canvasSize.height + polyStore.backgroundCellSize * 2) / (polyStore.backgroundCellSize * 0.865)),
        });
        return;
      case 'cellsize':
        polyStore.setCellsize(value);
        polyStore.setMaximum({
          maxCols: Math.ceil(((canvasStore.canvasSize.width + polyStore.backgroundCellSize * 2) / polyStore.backgroundCellSize) + 2),
          maxRows: Math.ceil((canvasStore.canvasSize.height + polyStore.backgroundCellSize * 2) / (polyStore.backgroundCellSize * 0.865)),
        });

      default:
    }
  }

  handleDownloadClick() {
    const {
      polyCanvas, imageCopy, backgroundCanvas, flattenCanvas,
    } = canvasStore;
    const drawn: HTMLCanvasElement[] = [imageCopy, backgroundCanvas, polyCanvas];
    Vue.prototype.$flattenImage(flattenCanvas, drawn);
  }

  @Watch('backgroundVisible')
  onBackgroundVisibleChanged(value: boolean) {
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

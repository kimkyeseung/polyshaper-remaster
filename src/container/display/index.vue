<template>
  <div class="display">
    <div
      class="display__contents"
      ref="canvasWrap"
      @click="handleClick">
      <canvas
        name="guide"
        :width="canvasWidth"
        :height="canvasHeight"/>
      <canvas
        name="poly"
        :width="canvasWidth"
        :height="canvasHeight"/>
      <canvas
        name="imageCopy"
        v-show="false"
        :width="canvasWidth"
        :height="canvasHeight"/>
      <img
        :src="uploadedImage"
        alt="user uploaded image"
        ref="image"
        @load="handleImageLoad"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import ImageStore from '@/store/imageStore';
import PolyStore from '@/store/polyStore';
import { cloneDeep } from 'lodash';
import { MousePosition, Vertex, Face } from '@/models/interfaces';

@Component
export default class Display extends Vue {
  private vertices: Vertex[] = [];
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private scaleFixRatio: MousePosition = {
    x: 0,
    y: 0,
  };

  private guideCanvas: HTMLCanvasElement;
  private polyCanvas: HTMLCanvasElement;
  private imageCopy: HTMLCanvasElement;

  public $refs!: {
    image: HTMLImageElement;
    canvasWrap: HTMLDivElement;
  }

  get uploadedImage(): string {
    if (!ImageStore.image) {
      ImageStore.getImageFromStorage();
    }
    return <string>ImageStore.image;
  }

  handleImageLoad({ currentTarget: img }: { currentTarget: HTMLImageElement }) {
    this.getImageData(img);
    this.setImageDataToStore(img);
    this.imageCopyToCanvas();
  }

  getImageData(img: HTMLImageElement) {
    this.canvasWidth = img.naturalWidth;
    this.canvasHeight = img.naturalHeight;
    this.scaleFixRatio.x = img.naturalWidth / img.width;
    this.scaleFixRatio.y = img.naturalHeight / img.height;
  }

  setImageDataToStore(img: HTMLImageElement) {
    const temporaryCanvas = document.createElement('canvas');
    temporaryCanvas.width = img.width;
    temporaryCanvas.height = img.height;

    const temporaryContext = temporaryCanvas.getContext('2d');
    temporaryContext.drawImage(img, 0, 0);

    const dataUrl = temporaryCanvas.toDataURL('image/png');
    ImageStore.uploadImageToStorage(dataUrl/* .replace(/^data:image\/(png|jpg);base64,/, "") */);
  }

  imageCopyToCanvas() {
    const context = this.imageCopy.getContext('2d');
    context.drawImage(this.$refs.image, 0, 0);
  }

  handleClick(ev: MouseEvent) {
    this.makeVertex(ev, this.guideCanvas);
  }

  makeVertex({ offsetX, offsetY }: MouseEvent, canvas: HTMLCanvasElement) {
    const x = offsetX * this.scaleFixRatio.x;
    const y = offsetY * this.scaleFixRatio.y;

    Vue.prototype.$makeVertexOnCanvas({ x, y }, canvas);
    const newVertex: Vertex = {
      vertexId: PolyStore.vertices.length + this.vertices.length,
      x,
      y,
      next: [],
    };
    this.vertices.push(newVertex);
    if (this.vertices.length === 3) {
      this.makeFace(<[ Vertex, Vertex, Vertex ]>this.vertices, this.polyCanvas);
    }
  }

  makeFace(vertices: [ Vertex, Vertex, Vertex ], canvas: HTMLCanvasElement) {
    vertices[0].next.push(vertices[1], vertices[2]);
    vertices[1].next.push(vertices[0], vertices[2]);
    vertices[2].next.push(vertices[0], vertices[1]);

    const newFace: Face = {
      faceId: PolyStore.faces.length || 0,
      color: 'red', // gonna change
      vertices: cloneDeep(this.vertices),
    };
    this.vertices.forEach((vertex: Vertex) => {
      PolyStore.addVertex(vertex);
    })
    PolyStore.addFace(newFace);
    Vue.prototype.$clearCanvas(this.guideCanvas);
    Vue.prototype.$makeFaceOnCanvas(newFace, canvas);
    this.vertices.length = 0;
  }

  mounted() {
    window.addEventListener('resize', this.getImageData.bind(this, <HTMLImageElement>this.$refs.image));
    this.guideCanvas = <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('guide');
    this.polyCanvas = <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('poly');
    this.imageCopy = <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('imageCopy');
  }
}

</script>

<template>
  <div class="display">
    <div
      class="display__contents"
      ref="canvasWrap"
      @mousemove="handleMouseMove"
      @click="handleClick">
      <canvas
        name="snap"
        :width="canvasWidth"
        :height="canvasHeight"/>
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
import UiStore from '@/store/uiStore';
import PolyStore from '@/store/polyStore';
import { cloneDeep } from 'lodash';
import { MousePosition, Vertex, Face, ColorData } from '@/models/interfaces';

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
  private snapCanvas: HTMLCanvasElement;
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

  get isAnimated(): boolean {
    return UiStore.isAnimated;
  }

  get vertextSnapGap(): number {
    return UiStore.vertexSnapGap;
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
    const context: CanvasRenderingContext2D = this.imageCopy.getContext('2d');
    context.drawImage(this.$refs.image, 0, 0);
  }

  handleClick(ev: MouseEvent) {
    this.makeVertex(ev, this.guideCanvas);
  }

  handleMouseMove(ev: MouseEvent) {
    this.snapToPoint(ev);
    this.positionChecker(ev);
  }

  mousePositionScaleFix({ x, y }: MousePosition): MousePosition {
    return {
      x: x * this.scaleFixRatio.x,
      y: y * this.scaleFixRatio.y,
    };
  }

  makeVertex({ offsetX, offsetY }: MouseEvent, canvas: HTMLCanvasElement) {
    let { x, y } = this.mousePositionScaleFix({ x: offsetX, y: offsetY })

    Vue.prototype.$makeVertexOnCanvas({ x, y }, canvas, this.isAnimated);
    const snap = PolyStore.vertices.getSnapPoint({ x: offsetX, y: offsetY });
    if (snap) {
      x = snap.x;
      y = snap.y;
    }
    // console.log(snappedX, snappedY);
    const newVertex: Vertex = {
      vertexId: PolyStore.vertices.getSize() + this.vertices.length,
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

    const color: ColorData = Vue.prototype.$getColorAverage(vertices, this.imageCopy, ImageStore.image);

    const newFace: Face = {
      faceId: PolyStore.faces.length || 0,
      color: Vue.prototype.$stringifyColorData(color),
      vertices: cloneDeep(this.vertices),
    };
    this.vertices.forEach((vertex: Vertex) => {
      PolyStore.addVertex(vertex);
    });
    PolyStore.addFace(newFace);
    Vue.prototype.$clearCanvas(this.guideCanvas);
    Vue.prototype.$makeFaceOnCanvas(newFace, canvas);
    this.vertices.length = 0;
  }

  positionChecker({ offsetX, offsetY }) {
    const vector = (from, to) => [to[0] - from[0], to[1] - from[1]];
    const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
    const p = [ offsetX, offsetY ];
    const context: CanvasRenderingContext2D = this.guideCanvas.getContext('2d');
    const guideColor = Vue.prototype.$getComplementaryColor({ x: offsetX, y: offsetY }, this.imageCopy, ImageStore.image);

    let { x, y } = this.mousePositionScaleFix({ x: offsetX, y: offsetY });
    const snap: Vertex = PolyStore.vertices.getSnapPoint({ x, y });
    if (snap) {
      x = snap.x;
      y = snap.y;
    }

    Vue.prototype.$guideLine({
        context,
        width: this.guideCanvas.width,
        height: this.guideCanvas.height
      },
      { x, y },
      Vue.prototype.$stringifyColorData(guideColor)
    );

    PolyStore.faces.every(face => {
      const a = [ face.vertices[0].x, face.vertices[0].y ];
      const b = [ face.vertices[1].x, face.vertices[1].y ];
      const c = [ face.vertices[2].x, face.vertices[2].y ];
      const v0 = vector(a, c);
      const v1 = vector(a, b);
      const v2 = vector(a, p);
      const dot00 = dot(v0, v0);
      const dot01 = dot(v0, v1);
      const dot02 = dot(v0, v2);
      const dot11 = dot(v1, v1);
      const dot12 = dot(v1, v2);
      const invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
      const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
      const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
      if ((u >= 0) && (v >= 0) && (u + v < 1)) {
        Vue.prototype.$selectFaceAnimation({
          context,
          width: this.guideCanvas.width,
          height: this.guideCanvas.height
        }, face);
        return false;
      }
      return true;
    });
  }

  snapToPoint({ offsetX, offsetY }) {
    const snap: Vertex = PolyStore.vertices.getSnapPoint({ x: offsetX, y: offsetY });
    const context: CanvasRenderingContext2D = this.snapCanvas.getContext('2d');
    if (snap) {
      Vue.prototype.$drawSnapGuide(snap, {
        context,
        width: this.snapCanvas.width,
        height: this.snapCanvas.height
      });
    } else {
      Vue.prototype.$cancelSnapGuide(context, this.snapCanvas.width, this.snapCanvas.height);
    }
  }

  mounted() {
    window.addEventListener('resize', this.getImageData.bind(this, <HTMLImageElement>this.$refs.image));
    this.guideCanvas = <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('guide');
    this.polyCanvas = <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('poly');
    this.snapCanvas = <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('snap');
    this.imageCopy = <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('imageCopy');
  }
}

</script>

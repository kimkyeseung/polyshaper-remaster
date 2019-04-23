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
        name="selectedFace"
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
        :width="canvasWidth"
        v-show="false"
        :height="canvasHeight"/>
      <canvas
        name="background"
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
import { Vue, Component, Watch, Mixins } from 'vue-property-decorator';
import ImageStore from '@/store/imageStore';
import UiStore from '@/store/uiStore';
import PolyStore from '@/store/polyStore';
import CanvasStore from '@/store/canvasStore';
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
  private pointedFace: Face = null;

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

  get vertextSnapGap(): number {
    return UiStore.vertexSnapGap;
  }

  handleImageLoad({ currentTarget: img }: { currentTarget: HTMLImageElement }) {
    this.getImageData(img);
    this.setImageDataToStore(img);
    this.$nextTick(this.imageCopyToCanvas);
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
    Vue.prototype.$drawBackgroundImage(this.$refs.image, CanvasStore.backgroundCanvas);
  }

  handleClick(ev: MouseEvent) {
    this.pointedFace
      ? this.selectFace(this.pointedFace)
      : this.makeVertex(ev, CanvasStore.guideCanvas);
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

    const snap = PolyStore.vertices.getSnapPoint({ x: offsetX, y: offsetY });
    if (snap) {
      x = snap.x;
      y = snap.y;
    }

    Vue.prototype.$makeVertexOnCanvas({ x, y });
    const newVertex: Vertex = {
      vertexId: PolyStore.vertices.getSize() + this.vertices.length,
      x,
      y,
      next: [],
    };
    this.vertices.push(newVertex);
    if (this.vertices.length === 3) {
      this.makeFace(<[ Vertex, Vertex, Vertex ]>this.vertices, CanvasStore.polyCanvas);
    }
  }

  makeFace(vertices: [ Vertex, Vertex, Vertex ], canvas: HTMLCanvasElement) {
    vertices[0].next.push(vertices[1], vertices[2]);
    vertices[1].next.push(vertices[0], vertices[2]);
    vertices[2].next.push(vertices[0], vertices[1]);

    const color: ColorData = Vue.prototype.$getColorAverage(vertices, CanvasStore.imageCopy, ImageStore.image);

    const newFace: Face = {
      faceId: PolyStore.faces.length || 0,
      color: Vue.prototype.$stringifyColorData(color),
      vertices: cloneDeep(this.vertices),
    };
    this.vertices.forEach((vertex: Vertex) => {
      PolyStore.addVertex(vertex);
    });
    PolyStore.addFace(newFace);
    Vue.prototype.$clearCanvas(CanvasStore.guideCanvas);
    Vue.prototype.$makeFaceOnCanvas(newFace, canvas);
    this.vertices.length = 0;
  }

  selectFace(face: Face) {
    PolyStore.selectFace(face);

    const context: CanvasRenderingContext2D = CanvasStore.selectedFace.getContext('2d');
    const color: ColorData = Vue.prototype.$colorDataParser(face.color);
    Vue.prototype.$displaySelectedFace({
      context,
      width: CanvasStore.selectedFace.width,
      height: CanvasStore.selectedFace.height
    }, face, Vue.prototype.$getComplementaryColor(color));
  }

  positionChecker({ offsetX, offsetY }: MouseEvent) {
    const context: CanvasRenderingContext2D = CanvasStore.guideCanvas.getContext('2d');
    const guideColor = Vue.prototype.$getComplementaryColorFromCoordinate({ x: offsetX, y: offsetY }, CanvasStore.imageCopy, ImageStore.image);

    let { x, y } = this.mousePositionScaleFix({ x: offsetX, y: offsetY });
    const snap: Vertex = PolyStore.vertices.getSnapPoint({ x, y });
    if (snap) {
      x = snap.x;
      y = snap.y;
    }

    Vue.prototype.$guideLine({
        context,
        width: CanvasStore.guideCanvas.width,
        height: CanvasStore.guideCanvas.height
      },
      { x, y },
      Vue.prototype.$stringifyColorData(guideColor)
    );

    PolyStore.faces.every((face: Face) => {
      if (Vue.prototype.$checkInsideTriangle({ x: offsetX, y: offsetY }, face)) {
        this.pointedFace = face;
        return false;
      }
      this.pointedFace = null;
      return true;
    });

    if (PolyStore.faces.length === 0) {
      this.pointedFace = null;
    }

    if (this.pointedFace) {
      Vue.prototype.$displayFaceBorder({
        context,
        width: CanvasStore.guideCanvas.width,
        height: CanvasStore.guideCanvas.height
      }, this.pointedFace);
    }
  }

  snapToPoint({ offsetX, offsetY }) {
    const snap: Vertex = PolyStore.vertices.getSnapPoint({ x: offsetX, y: offsetY });
    const context: CanvasRenderingContext2D = CanvasStore.snapCanvas.getContext('2d');

    snap
      ? Vue.prototype.$drawSnapGuide(snap, {
        context,
        width: CanvasStore.snapCanvas.width,
        height: CanvasStore.snapCanvas.height
      })
      : Vue.prototype.$cancelSnapGuide(context, CanvasStore.snapCanvas.width, CanvasStore.snapCanvas.height);
  }

  mounted() {
    window.addEventListener('resize', this.getImageData.bind(this, <HTMLImageElement>this.$refs.image));
    CanvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('snap'), canvasName: 'snapCanvas' });
    CanvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('selectedFace'), canvasName: 'selectedFace' });
    CanvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('guide'), canvasName: 'guideCanvas' });
    CanvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('poly'), canvasName: 'polyCanvas'});
    CanvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('background'), canvasName: 'backgroundCanvas'});
    CanvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('imageCopy'), canvasName: 'imageCopy'});
  }
}

</script>

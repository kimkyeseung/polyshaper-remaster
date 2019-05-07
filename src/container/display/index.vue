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
      <canvas
        name="flatten"
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
import { Vue, Component, Watch, Mixins } from 'vue-property-decorator';
import imageStore from '@/store/imageStore';
import uiStore from '@/store/uiStore';
import polyStore from '@/store/polyStore';
import canvasStore from '@/store/canvasStore';
import { cloneDeep } from 'lodash';
import { MousePosition, Vertex, Face, ColorData } from '@/models/interfaces';

@Component
export default class Display extends Vue {
  private vertices: Vertex[] = [];
  
  private scaleFixRatio: MousePosition = {
    x: 0,
    y: 0,
  };
  private pointedFace: Face = null;

  private snap: Vertex;

  public $refs!: {
    image: HTMLImageElement;
    canvasWrap: HTMLDivElement;
  }

  get canvasWidth(): number {
    return canvasStore.canvasSize.width;
  }

  get canvasHeight(): number {
    return canvasStore.canvasSize.height;
  }

  get uploadedImage(): string {
    if (!imageStore.image) {
      imageStore.getImageFromStorage();
    }
    return <string>imageStore.image;
  }

  handleImageLoad({ currentTarget: img }: { currentTarget: HTMLImageElement }) {
    this.getImageData(img);
    this.setImageDataToStore(img);
    this.$nextTick(this.imageCopyToCanvas);
  }

  getImageData(img: HTMLImageElement) {
    canvasStore.setCanvasSize({width: img.naturalWidth, height: img.naturalHeight});
    this.scaleFixRatio.x = img.naturalWidth / img.width;
    this.scaleFixRatio.y = img.naturalHeight / img.height;
    polyStore.setMaximum({
      maxCols: Math.ceil(((img.naturalWidth + polyStore.backgroundCellSize * 2) / polyStore.backgroundCellSize) + 2),
      maxRows: Math.ceil((img.naturalHeight + polyStore.backgroundCellSize * 2) / (polyStore.backgroundCellSize * 0.865))
    });
  }

  setImageDataToStore(img: HTMLImageElement) {
    const temporaryCanvas = document.createElement('canvas');
    temporaryCanvas.width = img.width;
    temporaryCanvas.height = img.height;

    const temporaryContext = temporaryCanvas.getContext('2d');
    temporaryContext.drawImage(img, 0, 0);

    const dataUrl = temporaryCanvas.toDataURL('image/png');
    imageStore.uploadImageToStorage(dataUrl/* .replace(/^data:image\/(png|jpg);base64,/, "") */);
  }

  imageCopyToCanvas() {
    Vue.prototype.$drawBackgroundImage(this.$refs.image, canvasStore.backgroundCanvas);
  }

  handleClick(ev: MouseEvent) {
    if (polyStore.selectedFace) {
      if (!this.pointedFace) {
        this.handleDeselectFace();
      } else if (this.snap) {
        this.makeVertex(ev, canvasStore.guideCanvas);
      } else {
        this.handleSelectFace(this.pointedFace);
      }
    } else {
      if (this.pointedFace && !this.snap) { 
        this.handleSelectFace(this.pointedFace);
      } else {
        this.makeVertex(ev, canvasStore.guideCanvas);
      }
    }
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
    let { x, y } = this.mousePositionScaleFix({ x: offsetX, y: offsetY });
    if (this.snap) {
      x = this.snap.x;
      y = this.snap.y;
    }

    Vue.prototype.$makeVertexOnCanvas({ x, y });
    const newVertex: Vertex = {
      vertexId: polyStore.vertices.getSize() + this.vertices.length,
      x,
      y,
      next: [],
    };
    this.vertices.push(newVertex);
    if (this.vertices.length === 3) {
      this.makeFace(<[ Vertex, Vertex, Vertex ]>this.vertices, canvasStore.polyCanvas);
    }
  }

  makeFace(vertices: [ Vertex, Vertex, Vertex ], canvas: HTMLCanvasElement) {
    vertices[0].next.push(vertices[1], vertices[2]);
    vertices[1].next.push(vertices[0], vertices[2]);
    vertices[2].next.push(vertices[0], vertices[1]);

    const color: ColorData = Vue.prototype.$getColorAverage(vertices, canvasStore.imageCopy, canvasStore.backgroundCanvas);
    // $getColorAverage: 원본 이미지의 색상을 얻으려면 세 번째 인자로 imageStore.image, 보여지는 색상 값을 얻으려면 canvasStore.backgroundCanvas.

    const newFace: Face = {
      faceId: polyStore.faces.length || 0,
      color: Vue.prototype.$stringifyColorData(color),
      vertices: cloneDeep(this.vertices),
    };
    this.vertices.forEach((vertex: Vertex) => {
      polyStore.addVertex(vertex);
    });
    polyStore.addFace(newFace);
    Vue.prototype.$clearCanvas(canvasStore.guideCanvas);
    Vue.prototype.$makeFaceOnCanvas(newFace, canvas);
    this.vertices.length = 0;
  }

  handleSelectFace(face: Face) {
    polyStore.selectFace(face);

    const context: CanvasRenderingContext2D = canvasStore.selectedFace.getContext('2d');
    const color: ColorData = Vue.prototype.$colorDataParser(face.color);
    Vue.prototype.$displaySelectedFace({
      context,
      width: canvasStore.selectedFace.width,
      height: canvasStore.selectedFace.height
    }, face, Vue.prototype.$getComplementaryColor(color));
  }
  
  handleDeselectFace() {
    polyStore.deselectFace();
    Vue.prototype.$clearCanvas(canvasStore.selectedFace);
    Vue.prototype.$clearCanvas(canvasStore.guideCanvas);
  }

  positionChecker({ offsetX, offsetY }: MouseEvent) {
    const context: CanvasRenderingContext2D = canvasStore.guideCanvas.getContext('2d');
    const guideColor = Vue.prototype.$getComplementaryColorFromCoordinate({ x: offsetX, y: offsetY }, canvasStore.imageCopy, imageStore.image);

    let { x, y } = this.mousePositionScaleFix({ x: offsetX, y: offsetY });
    if (this.snap) {
      x = this.snap.x;
      y = this.snap.y;
    }

    const color: string = Vue.prototype.$stringifyColorData(guideColor);
    Vue.prototype.$guideLine({
        context,
        width: canvasStore.guideCanvas.width,
        height: canvasStore.guideCanvas.height
      },
      { x, y },
      color
    );

    polyStore.faces.every((face: Face) => {
      if (Vue.prototype.$checkInsideTriangle({ x: offsetX, y: offsetY }, face)) {
        this.pointedFace = face;
        return false;
      }
      this.pointedFace = null;
      return true;
    });

    if (polyStore.faces.length === 0) {
      this.pointedFace = null;
    }

    if (this.pointedFace) {
      Vue.prototype.$displayFaceBorder({
        context,
        width: canvasStore.guideCanvas.width,
        height: canvasStore.guideCanvas.height
      }, this.pointedFace);
    }
  }

  snapToPoint({ offsetX, offsetY }) {
    this.snap = polyStore.vertices.getSnapPoint({ x: offsetX, y: offsetY });
    const context: CanvasRenderingContext2D = canvasStore.snapCanvas.getContext('2d');

    this.snap
      ? Vue.prototype.$drawSnapGuide(this.snap, {
        context,
        width: canvasStore.snapCanvas.width,
        height: canvasStore.snapCanvas.height
      })
      : Vue.prototype.$cancelSnapGuide(context, canvasStore.snapCanvas.width, canvasStore.snapCanvas.height);
  }

  mounted() {
    window.addEventListener('resize', this.getImageData.bind(this, <HTMLImageElement>this.$refs.image));
    canvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('snap'), canvasName: 'snapCanvas' });
    canvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('selectedFace'), canvasName: 'selectedFace' });
    canvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('guide'), canvasName: 'guideCanvas' });
    canvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('poly'), canvasName: 'polyCanvas'});
    canvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('background'), canvasName: 'backgroundCanvas'});
    canvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('flatten'), canvasName: 'flattenCanvas'});
    canvasStore.mountCanvasElement({ canvas: <HTMLCanvasElement>this.$refs.canvasWrap.children.namedItem('imageCopy'), canvasName: 'imageCopy'});
  }
}

</script>

<template>
  <div class="display">
    <div class="display__contents">
      <canvas
        class="display__canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        @click="handleClick"/>
      <img
        :src="uploadedImage"
        alt="user uploaded image"
        ref="image"
        @load="handleImageLoad"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ImageStore from '@/store/imageStore';
import PolyStore from '@/store/polyStore';
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

  get uploadedImage(): string {
    return <string>ImageStore.image;
  }

  handleImageLoad({ currentTarget: img }: { currentTarget: HTMLImageElement }) {
    this.getImageData(img);
  }

  getImageData(img: HTMLImageElement) {
    this.canvasWidth = img.naturalWidth;
    this.canvasHeight = img.naturalHeight;
    this.scaleFixRatio.x = img.naturalWidth / img.width;
    this.scaleFixRatio.y = img.naturalHeight / img.height;
  }

  handleClick(ev: MouseEvent) {
    this.makeVertex(ev, ev.currentTarget as HTMLCanvasElement);
  }

  makeVertex({ offsetX, offsetY }: MouseEvent, canvas: HTMLCanvasElement) {
    const x = offsetX * this.scaleFixRatio.x;
    const y = offsetY * this.scaleFixRatio.y;
    this.$makeVertexOnCanvas({ x, y }, canvas);
    const newVertex: Vertex = {
      vertexId: PolyStore.vertices.length + this.vertices.length,
      x,
      y,
      next: [],
    };
    this.vertices.push(newVertex);
    if (this.vertices.length === 3) {
      this.makeFace(<[ Vertex, Vertex, Vertex ]>this.vertices);
    }
  }

  makeFace(vertices: [ Vertex, Vertex, Vertex ]) {
    vertices[0].next.push(vertices[1], vertices[2]);
    vertices[1].next.push(vertices[0], vertices[2]);
    vertices[2].next.push(vertices[0], vertices[1]);

    const newFace: Face = {
      faceId: PolyStore.faces.length,
      color: 'red', // gonna change
      vertices: this.vertices,
    }
    this.vertices.forEach((vertex: Vertex) => {
      PolyStore.addVertex(vertex);
    })
    PolyStore.addFace(newFace);
    this.vertices.length = 0;
    console.log(PolyStore.vertices);
    console.log(PolyStore.faces);
  }

  mounted() {
    window.addEventListener('resize', this.getImageData.bind(this, <HTMLImageElement>this.$refs.image));
  }
}

</script>

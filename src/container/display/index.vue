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
        @load="getImageData"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ImageStore from '@/store/imageStoreModule';
import { MousePosition } from '@/models/interfaces';

@Component
export default class Display extends Vue {
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
    this.makeVertexOnCanvas(ev, ev.currentTarget as HTMLCanvasElement);
  }

  makeVertexOnCanvas({ offsetX: x, offsetY: y}: MouseEvent, canvas: HTMLCanvasElement) {
    const context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');

    context.beginPath();
    context.arc(x * this.scaleFixRatio.x, y * this.scaleFixRatio.y, 3, 0, Math.PI * 2);

    context.fillStyle = 'red';
    context.fill();
  }

  mounted() {
    window.addEventListener('resize', this.getImageData.bind(this, <HTMLImageElement>this.$refs.image));
  }
}

</script>

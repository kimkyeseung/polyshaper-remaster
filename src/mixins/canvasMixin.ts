import { Vue, Component } from 'vue-property-decorator';

@Component
export default class CanvasMixin extends Vue {
  public guideCanvas: HTMLCanvasElement;
  public polyCanvas: HTMLCanvasElement;
  public snapCanvas: HTMLCanvasElement;
  public imageCopy: HTMLCanvasElement;
}

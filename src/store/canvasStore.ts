import {
  VuexModule, Module, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import store from '@/store';

@Module({ dynamic: true, name: 'canvasStore', store })
class CanvasStore extends VuexModule {
  public guideCanvas: HTMLCanvasElement = null;

  public polyCanvas: HTMLCanvasElement = null;

  public snapCanvas: HTMLCanvasElement = null;

  public imageCopy: HTMLCanvasElement = null;

  public selectedFace: HTMLCanvasElement = null;

  public backgroundCanvas: HTMLCanvasElement = null;

  public canvasSize: {
    width: number;
    height: number;
  } = {
    width: 0,
    height: 0
  }

  @Mutation
  updateCanvasElement({ canvas, canvasName }: {canvas: HTMLCanvasElement, canvasName: string}) {
    this[canvasName] = canvas;
  }

  @Mutation
  updateCanvasSize(size: { width: number, height: number }) {
    this.canvasSize = size;
  }

  @Action
  mountCanvasElement({ canvas, canvasName }: {canvas: HTMLCanvasElement, canvasName: string}) {
    this.context.commit('updateCanvasElement', { canvas, canvasName });
  }

  @Action
  setCanvasSize(size: { width: number, height: number }) {
    this.context.commit('updateCanvasSize', size);
  }
}

export default getModule(CanvasStore);

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

  @Mutation
  updateCanvasElement({ canvas, canvasName }: {canvas: HTMLCanvasElement, canvasName: string}) {
    this[canvasName] = canvas;
  }

  @Action
  mountCanvasElement({ canvas, canvasName }: {canvas: HTMLCanvasElement, canvasName: string}) {
    this.context.commit('updateCanvasElement', { canvas, canvasName });
  }
}

export default getModule(CanvasStore);

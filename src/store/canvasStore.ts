import {
  VuexModule, Module, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import store from '@/store';

@Module({ dynamic: true, name: 'canvasStore', store })
class CanvasStore extends VuexModule {
  public guideCanvas: HTMLCanvasElement | null = null;

  public polyCanvas: HTMLCanvasElement | null = null;

  public snapCanvas: HTMLCanvasElement | null = null;

  public imageCopy: HTMLCanvasElement | null = null;

  @Mutation
  updateCanvasElement({ canvas, canvasName }: {canvas: HTMLCanvasElement, canvasName: string}) {
    this[canvasName] = canvas;
    console.log(this[canvasName], '123ffffffff', canvasName);
  }

  @Action
  mountCanvasElement({ canvas, canvasName }: {canvas: HTMLCanvasElement, canvasName: string}) {
    this.context.commit('updateCanvasElement', { canvas, canvasName });
  }
}

export default getModule(CanvasStore);

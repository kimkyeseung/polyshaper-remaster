import {
  VuexModule, Module, getModule, Mutation, Action,
} from 'vuex-module-decorators';
import store from '@/store';
import { TitleModel } from '@/models/interfaces';

@Module({ dynamic: true, name: 'uiStore', store })
class UiStore extends VuexModule {
  public title: TitleModel = {
    main: 'Polyshaper',
    sub: 'REMASTER',
  };

  public isAnimated: boolean = true; // make true temporarly, default is false;

  public vertexSnapGap: number = 10;

  @Mutation
  toggleAnimated(value: boolean | null) {
    this.isAnimated = !!value;
  }

  @Mutation
  updateVertexSnapGap(gap: number) {
    this.vertexSnapGap = gap;
  }

  @Action
  turnOnAnimate(value: boolean) {
    this.context.commit('toggleAnimated', value);
  }

  @Action
  turnOffAnimate() {
    this.context.commit('toggleAnimated');
  }

  @Action
  setVertexSnapGap(gap: number) {
    this.context.commit('updateVertexSnapGap', gap);
  }
}

export default getModule(UiStore);

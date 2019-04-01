import { VuexModule, Module, getModule, Mutation, Action } from 'vuex-module-decorators';
import store from '@/store';
import { TitleModel } from '@/models/interfaces';

@Module({ dynamic: true, name: 'uiStore', store })
class UiStore extends VuexModule {
  public title: TitleModel = {
    main: 'Polyshaper',
    sub: 'REMASTER',
  };

  public isAnimated: boolean = true; // make true temporarly, default is false;

  @Mutation
  toggleAnimated(value: boolean | null) {
    this.isAnimated = !!value;
  }

  @Action
  turnOnAnimate(value: boolean) {
    this.context.commit('toggleAnimated', value);
  }

  @Action
  turnOffAnimate() {
    this.context.commit('toggleAnimated');
  }
}

export default getModule(UiStore);

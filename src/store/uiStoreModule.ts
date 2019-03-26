import { VuexModule, Module, getModule } from 'vuex-module-decorators';
import store from '@/store';
import { TitleModel } from '@/models/interfaces';

@Module({ dynamic: true, name: 'uiStore', store })
class uiStore extends VuexModule {
  public title: TitleModel = {
    main: 'Polyshaper',
    sub: 'REMASTER',
  };
}

export default getModule(uiStore);

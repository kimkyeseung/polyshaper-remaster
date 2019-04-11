import {
  VuexModule, Module, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { Vertex, Face } from '@/models/interfaces';
import { CoordinateTable } from '@/helpers/coordinateTable';

@Module({ dynamic: true, name: 'polyStore', store })
class PolyStore extends VuexModule {
  public vertices: CoordinateTable = new CoordinateTable();

  public faces: Face[] = [];

  @Mutation
  pushVertex(vertex: Vertex) {
    this.vertices.set(vertex);
  }

  @Mutation
  pushFace(face: Face) {
    this.faces.push(face);
  }

  @Mutation
  initializeState() {
    this.vertices = new CoordinateTable();
    this.faces = [];
  }

  @Action
  addVertex(vertex: Vertex) {
    this.context.commit('pushVertex', vertex);
  }
  
  @Action
  addFace(face: Face) {
    this.context.commit('pushFace', face);
  }

  @Action
  initialize() {
    this.context.commit('initializeState');
  }
}

export default getModule(PolyStore);

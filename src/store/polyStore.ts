import {
  VuexModule, Module, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { Vertex, Face } from '@/models/interfaces';
import CoordinateTable from '@/helpers/coordinateTable';

@Module({ dynamic: true, name: 'polyStore', store })
class PolyStore extends VuexModule {
  public vertices: CoordinateTable = new CoordinateTable();

  public snapVertex: Vertex;

  public faces: Face[] = [];

  public selectedFace: Face | null = null;

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

  @Mutation
  updateSelectedFace(face: Face) {
    this.selectedFace = face;
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

  @Action
  selectFace(face: Face) {
    this.context.commit('updateSelectedFace', face);
  }

  @Action
  changeFaceColor(color) {
    this.selectedFace.color = color;
    this.context.commit('updateSelectedFace', this.selectedFace);
  }
}

export default getModule(PolyStore);

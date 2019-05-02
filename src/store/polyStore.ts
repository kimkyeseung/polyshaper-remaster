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

  public selectedFace: Face = null;

  public backgroundVisible: boolean = true;

  public maxCols: number = 0;

  public maxRows: number = 0;

  public backgroundVariance: number = 0.4;

  public backgroundCellSize: number = 60;

  @Mutation
  pushVertex(vertex: Vertex) {
    this.vertices.set(vertex);
  }

  @Mutation
  popVertex({ x, y }: Vertex) {
    this.vertices.remove({ x, y });
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

  @Mutation
  removeSelectedFace() {
    this.selectedFace = null;
  }

  @Mutation
  popFace(face: Face) {
    const faceIndex: number = this.faces.findIndex(faceTarget => faceTarget === face);
    this.faces.splice(faceIndex, 1);
  }

  @Mutation
  updateBackgroundVisible(value: boolean) {
    this.backgroundVisible = value;
  }

  @Mutation
  updateMaximum({ maxCols, maxRows }: { maxCols: number, maxRows: number }) {
    this.maxCols = maxCols;
    this.maxRows = maxRows;
  }

  @Mutation
  updateVariance(variance: number) {
    this.backgroundVariance = variance;
  }

  @Mutation
  updateCellsize(cellsize: number) {
    this.backgroundCellSize = cellsize;
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
    face.vertices.forEach((vertex: Vertex) => {
      this.context.commit('popVertex', vertex);
    });
  }

  @Action
  deselectFace() {
    this.context.commit('removeSelectedFace');
  }

  @Action
  changeFaceColor(color: string) {
    this.selectedFace.color = color;
    this.context.commit('updateSelectedFace', this.selectedFace);
  }

  @Action
  removeFace(face: Face) {
    this.context.commit('popFace', face);
  }

  @Action
  toggleBackgroundVisible(value: boolean) {
    this.context.commit('updateBackgroundVisible', value);
  }

  @Action
  setMaximum(maximum: { maxCols: number, maxRows: number }) {
    this.context.commit('updateMaximum', maximum);
  }

  @Action
  setVariance(variance: string) {
    this.context.commit('updateVariance', variance);
  }

  @Action
  setCellsize(cellsize: string) {
    this.context.commit('updateCellsize', cellsize);
  }

  @Action
  initPoly() {
    this.context.commit('initializeState');
  }
}

export default getModule(PolyStore);

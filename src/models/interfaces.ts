export interface TitleModel {
  main: string;
  sub: string;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface InputFileEvent {
  target: FileList | DataTransfer;
}

interface FileList {
  files: File[];
}

export interface Vertex extends MousePosition{
  vertexId: number;
  next: [ Vertex?, Vertex? ];
}

export interface Face {
  faceId: number;
  color: string;
  vertices: [ Vertex, Vertex, Vertex ];
}

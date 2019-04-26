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
  next: Vertex[];
  col?: number;
  row?: number;
}

export interface Face {
  faceId: number;
  color: string;
  vertices: [ Vertex, Vertex, Vertex ];
  selected?: boolean;
}

export interface ColorData {
  r: number;
  g: number;
  b: number;
}

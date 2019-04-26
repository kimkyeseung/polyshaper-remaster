import {
  MousePosition, Face, ColorData, Vertex,
} from '@/models/interfaces';

const canvasHelper = {
  install(vue) {
    vue.vertexStack = [];

    vue.imgaeMemoize;

    vue.prototype.$drawBackgroundImage = (image: HTMLImageElement = vue.imgaeMemoize, canvas: HTMLCanvasElement, opacity: number = 1) => {
      if (!vue.imgaeMemoize) {
        vue.imgaeMemoize = image;
      }
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      context.save();
      context.globalAlpha = opacity;
      context.drawImage(image, 0, 0);
      context.restore();
    };

    vue.prototype.$fillBackgroundColor = (color: string, canvas: HTMLCanvasElement, composition: string = 'source-over') => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      context.save();
      context.globalCompositeOperation = composition;
      context.fillStyle = color;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
    };

    vue.prototype.$makeVertexOnCanvas = ({ x, y }: MousePosition) => {
      vue.vertexStack.push({ x, y });
    };

    vue.prototype.$makeFaceOnCanvas = ({ color, vertices }: Face, canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      context.save();
      vertices.forEach((vertex: Vertex) => {
        context.beginPath();
        context.moveTo(vertex.x, vertex.y);
        vertex.next.forEach((next: Vertex) => {
          context.lineTo(next.x, next.y);
        });
        context.closePath();
        context.fillStyle = color;
        context.fill();
      });
      context.restore();
      vue.vertexStack.length = 0;
    };

    vue.prototype.$clearCanvas = (canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    vue.prototype.$drawAllFaces = (canvas: HTMLCanvasElement, faces: Face[]) => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.beginPath();
      faces.forEach((face: Face) => {
        face.vertices.forEach((vertex: Vertex) => {
          context.beginPath();
          context.moveTo(vertex.x, vertex.y);
          vertex.next.forEach((next: Vertex) => {
            context.lineTo(next.x, next.y);
          });
          context.closePath();
          context.fillStyle = face.color;
          context.fill();
        });
      });
      context.restore();
    };

    vue.prototype.$getColorAverage = (vertices: Face['vertices'], canvas: HTMLCanvasElement, imageData: HTMLCanvasElement | string): ColorData => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      const [{ x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 }] = vertices;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x3, y3);
      context.closePath();
      context.clip();

      const biggestX = Math.max(x1, x2, x3);
      const biggestY = Math.max(y1, y2, y3);
      const smallestX = Math.min(x1, x2, x3);
      const smallestY = Math.min(y1, y2, y3);

      if (typeof imageData === 'string') {
        const img = document.createElement('img');
        img.src = imageData;
        context.drawImage(img, 0, 0);
      } else {
        context.drawImage(imageData, 0, 0);
      }

      const { data }: { data: Uint8ClampedArray } = context.getImageData(smallestX, smallestY, Math.ceil(biggestX - smallestX) || 1, Math.ceil(biggestY - smallestY) || 1);
      let count = 0;
      const rgb: ColorData = { r: 0, g: 0, b: 0 };
      for (let i = -4; i < data.length; i += 20) {
        if (data[i + 3] > 200) {
          ++count;
          rgb.r += data[i];
          rgb.g += data[i + 1];
          rgb.b += data[i + 2];
        }
      }
      rgb.r = ~~(rgb.r / count);
      rgb.g = ~~(rgb.g / count);
      rgb.b = ~~(rgb.b / count);
      context.restore();
      return rgb;
    };

    vue.prototype.$getComplementaryColorFromCoordinate = ({ x, y }: MousePosition, canvas: HTMLCanvasElement, imageData: string): ColorData => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      const { data }: { data: Uint8ClampedArray } = context.getImageData(x, y, 1, 1);

      const img = document.createElement('img');
      img.src = imageData;
      context.drawImage(img, x - 5, y - 5, 10, 10, x - 5, y - 5, 10, 10); // for stability draw 10px rect not (img, x, y, 1, 1, x, y, 1, 1)

      const rgb: ColorData = {
        r: 255 - data[0],
        g: 255 - data[1],
        b: 255 - data[2],
      };
      return rgb;
    };

    vue.prototype.$getComplementaryColor = (color: ColorData): ColorData => ({
      r: 255 - color.r,
      g: 255 - color.g,
      b: 255 - color.b,
    });

    vue.prototype.$displayFaceBorder = ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number }, { vertices }: Face) => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.beginPath();
      context.lineJoin = 'round';
      vertices.forEach((vertex: Vertex) => {
        context.beginPath();
        context.moveTo(vertex.x, vertex.y);
        vertex.next.forEach((next: Vertex) => {
          context.lineTo(next.x, next.y);
        });
        context.closePath();

        context.lineWidth = 1;
        context.strokeStyle = 'rgb(255, 127, 0)';
        context.stroke();
      });
      context.restore();
    };

    vue.prototype.$displaySelectedFace = ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number }, { vertices }: Face, { r, g, b }: ColorData) => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.beginPath();
      context.lineJoin = 'round';
      vertices.forEach((vertex: Vertex) => {
        context.beginPath();
        context.moveTo(vertex.x, vertex.y);
        vertex.next.forEach((next: Vertex) => {
          context.lineTo(next.x, next.y);
        });
        context.closePath();

        context.lineWidth = 2;
        context.strokeStyle = `rgb(${r}, ${g}, ${b})`;

        context.shadowColor = 'rgba(0, 0, 0, .4)';
        context.shadowBlur = 8;
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.stroke();
      });
      context.restore();
    };

    vue.prototype.$guideLine = ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number }, { x, y }, color?: string) => {
      context.save();
      context.clearRect(0, 0, width, height);
      if (vue.vertexStack.length === 0) {
        return;
      }
      context.beginPath();
      context.lineJoin = 'round';
      context.moveTo(vue.vertexStack[0].x, vue.vertexStack[0].y);
      vue.vertexStack.forEach(({ x, y }) => {
        context.arc(x, y, 3, 0, Math.PI * 2);
        context.fillStyle = color || 'red';
        context.fill();
        context.lineTo(x, y);
      });
      context.lineTo(x, y);
      context.closePath();
      context.lineWidth = 2;
      context.strokeStyle = color || 'rgb(255, 127, 0)';
      context.stroke();
      context.restore();
    };

    vue.snapGuide;

    vue.prototype.$drawSnapGuide = ({ x, y }: Vertex, { context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number }) => {
      // function snapMotion(time) {
      //   context.clearRect(0, 0, width, height);
      //   let start: number = time % 1000;
      //   context.beginPath();
      //   context.arc(x, y, start / 100, 0, Math.PI * 2);
      //   context.fillStyle = `rgba(0, 0, 0, ${100 / start})`;
      //   context.fill();
      //   context.closePath();
      //   vue.snapGuide = window.requestAnimationFrame(snapMotion);
      // }
      // window.requestAnimationFrame(snapMotion);
      context.save();
      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fillStyle = 'orange';
      context.fill();
      context.closePath();
      context.restore();
    };

    vue.prototype.$cancelSnapGuide = (context: CanvasRenderingContext2D, width: number, height: number) => {
      context.clearRect(0, 0, width, height);
      window.cancelAnimationFrame(vue.snapGuide);
    };

    vue.prototype.$autoPopulate = (maximum: { maxCols: number, maxRows: number }, variance: number, cellsize: number): Vertex[] => {
      const backgroundVertexNode: Vertex[] = [];
      let row = 0;
      let col = 0;
      const { maxCols, maxRows } = maximum;
      const amount: number = maxCols * maxRows;
      for (let i = 0; i < amount; i++) {
        const vertex = <Vertex>{};
        if (row % 2 === 0) {
          vertex.x = (col * cellsize) - cellsize;
        } else {
          vertex.x = (col * cellsize) - cellsize - cellsize / 2;
        }
        vertex.x += (Math.random() - 0.5) * variance * cellsize * 2;
        vertex.y = (row * cellsize * 0.865) - cellsize;
        vertex.y += (Math.random() - 0.5) * variance * cellsize * 2;
        vertex.col = col;
        vertex.row = row;
        vertex.next = [];
        backgroundVertexNode.push(vertex);
        col++;
        if ((i + 1) % maxCols === 0) {
          row++;
          col = 0;
        }
      }
      return backgroundVertexNode;
    };

    vue.prototype.$somethingBackground = (vertices: Vertex[], maxCols: number) => {
      for (let i = 0; i < vertices.length; i++) {

      }
    };
  },
};

export default canvasHelper;

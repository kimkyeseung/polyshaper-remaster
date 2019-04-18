import { MousePosition, Face, ColorData, Vertex } from '@/models/interfaces';

const canvasHelper = {
  install(vue) {
    vue.prototype.$makeVertexOnCanvas = ({ x, y }: MousePosition, canvas: HTMLCanvasElement, animated: boolean) => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      // if (animated) {
      //   vue.vertexStack.push({ x, y });
      //   vue.blinkAnimation(canvas);
      // } else {
      //   context.beginPath();
      //   context.arc(x, y, 3, 0, Math.PI * 2);
      //   context.fillStyle = 'red';
      //   context.fill();
      // }

      vue.vertexStack.push({ x, y });
    };

    vue.prototype.$makeFaceOnCanvas = ({ color, vertices }: Face, canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
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
      vue.vertexStack.length = 0;
    };

    vue.prototype.$clearCanvas = (canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    vue.prototype.$getColorAverage = (vertices: Face['vertices'], canvas: HTMLCanvasElement, imageData: string): ColorData => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      const [{ x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 }] = vertices;
      context.save();
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x3, y3);
      context.closePath();
      context.clip();

      const img = document.createElement('img');
      img.src = imageData;
      context.drawImage(img, 0, 0);

      const biggestX = Math.max(x1, x2, x3);
      const biggestY = Math.max(y1, y2, y3);
      const smallestX = Math.min(x1, x2, x3);
      const smallestY = Math.min(y1, y2, y3);
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

    vue.prototype.$getComplementaryColor = ({ x, y }: MousePosition, canvas: HTMLCanvasElement, imageData: string): ColorData => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      const { data }: { data: Uint8ClampedArray } = context.getImageData(x, y, 1, 1);

      const img = document.createElement('img');
      img.src = imageData;
      context.drawImage(img, x - 5, y - 5, 10, 10, x - 5, y - 5, 10, 10); // for stability draw 10px rect not (img, x, y, 1, 1, x, y, 1, 1)

      let count = 0;
      const rgb: ColorData = {
        r: 255 - data[0],
        g: 255 - data[1],
        b: 255 - data[2],
      };
      return rgb;
    };

    vue.vertexStack = []; // 현재는 애니메이션이 들어갈 점들을 배열에 담아두었다. 애니메이션이 적용될

    // vue.blinkAnimation = (canvas: HTMLCanvasElement) => {
    //   const context: CanvasRenderingContext2D = canvas.getContext('2d');

    //   function blink(timestamp) {
    //     let start: number = timestamp % 1000;
    //     context.clearRect(0, 0, canvas.width, canvas.height);

    //     vue.vertexStack.forEach((animatedVertex: MousePosition) => {

    //       context.beginPath();
    //       context.arc(animatedVertex.x, animatedVertex.y, start / 100, 0, Math.PI * 2);
    //       context.fillStyle = `rgba(0, 0, 0, ${100 / start})`;
    //       context.fill();
    //       context.closePath();
    //     });

    //     const id = window.requestAnimationFrame(blink);
    //     if (!vue.vertexStack.length) {
    //       console.log('done') ;
    //       window.cancelAnimationFrame(id);
    //     }
    //   }

    //   window.requestAnimationFrame(blink);
    // };

    vue.prototype.$selectFaceAnimation = ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number }, { vertices }: Face) => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.beginPath();
      vertices.forEach((vertex: Vertex) => {
        context.beginPath();
        context.moveTo(vertex.x, vertex.y);
        vertex.next.forEach((next: Vertex) => {
          context.lineTo(next.x, next.y);
        });
        context.closePath();

        context.lineWidth = 2;
        context.strokeStyle = 'rgb(255, 127, 0)';

        context.shadowColor = 'rgba(0, 0, 0, .4)';
        context.shadowBlur = 8;
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.stroke();
      });
      context.restore();
    };

    vue.prototype.$guideLine = ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number }, { x, y }, color?: string) => {
      context.clearRect(0, 0, width, height);
      if (vue.vertexStack.length === 0) {
        return;
      }
      context.beginPath();
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
      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fillStyle = 'orange';
      context.fill();
      context.closePath();
    };

    vue.prototype.$cancelSnapGuide = (context: CanvasRenderingContext2D, width: number, height: number) => {
      context.clearRect(0, 0, width, height);
      window.cancelAnimationFrame(vue.snapGuide);
    };
  },
};

export default canvasHelper;

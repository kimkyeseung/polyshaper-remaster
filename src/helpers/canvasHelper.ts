import { MousePosition, Face, ColorData } from '@/models/interfaces';

const canvasHelper = {
  install(vue) {
    vue.prototype.$makeVertexOnCanvas = ({ x, y }: MousePosition, canvas: HTMLCanvasElement, animated: boolean) => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      if (animated) {
        vue.animatedVertexStack.push({ x, y });
        vue.blinkAnimation(canvas);
      } else {
        context.beginPath();
        context.arc(x, y, 3, 0, Math.PI * 2);
        context.fillStyle = 'red';
        context.fill(); 
      }
    };

    vue.prototype.$makeFaceOnCanvas = ({ color, vertices }: Face, canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      vertices.forEach((vertex) => {
        context.beginPath();
        context.moveTo(vertex.x, vertex.y);
        vertex.next.forEach((next) => {
          context.lineTo(next.x, next.y);
        });
        context.closePath();
        context.fillStyle = color;
        context.fill();
      });
      setTimeout(() => {
        vue.animatedVertexStack.length = 0;
      }, 1000);
    };

    vue.prototype.$clearCanvas = (canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    vue.prototype.$getColorAverage = (vertices: Face["vertices"], canvas: HTMLCanvasElement, imageData: string): ColorData => {
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
      const { data } = context.getImageData(smallestX, smallestY, Math.ceil(biggestX - smallestX) || 1, Math.ceil(biggestY - smallestY) || 1);
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

    // vue.blinkVertex = ({ x, y }: MousePosition, canvas: HTMLCanvasElement) => {
    //   const context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');

    //   function blink(timestamp) {
    //     let start = timestamp % 1000;
    //     // console.log(timestamp);
    //     context.beginPath();
    //     context.clearRect(0, 0, 300, 300);
    //     context.arc(x, y, start / 100, 0, Math.PI * 2);
    //     context.fillStyle = `rgba(0, 0, 0, ${100 / start})`;
    //     context.fill();
    //     const id = window.requestAnimationFrame(blink);
    //     // if (timestamp > 10000) {
    //     //   console.log('timeover') ;
    //     //   window.cancelAnimationFrame(id);
    //     // }
    //   }

    //   window.requestAnimationFrame(blink);
    // };

    vue.animatedVertexStack = [];

    vue.blinkAnimation = (canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = canvas.getContext('2d');

      function blink(timestamp) {
        let start: number = timestamp % 1000;
        context.clearRect(0, 0, canvas.width, canvas.height);

        vue.animatedVertexStack.forEach((animatedVertex: MousePosition) => {

          context.beginPath();
          context.arc(animatedVertex.x, animatedVertex.y, start / 100, 0, Math.PI * 2);
          context.fillStyle = `rgba(0, 0, 0, ${100 / start})`;
          context.fill();
          context.closePath();
        });

        const id = window.requestAnimationFrame(blink);
        if (!vue.animatedVertexStack.length) {
          console.log('done') ;
          window.cancelAnimationFrame(id);
        }
      }

      window.requestAnimationFrame(blink);
    }
  },
};

export default canvasHelper;

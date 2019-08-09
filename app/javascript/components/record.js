import RecordControls from "./record-controls";

let imgCache = {};
let imgLoading = false;
let imgQueue = [];
const BOTTOM_BORDER_FACTOR = 6;

const Record = {
  init: function(ctx) {
    this.ctx = ctx;
    RecordControls.init(ctx);
  },
  clearImageCache: function() {
    imgCache = {};
  },
  render: function(props, isZooming = false) {
    isZooming = false;
    const { borderSize, fullWidth, fullHeight } = this.computeBorderSize(props);
    const fullProps = {
      ...props,
      borderSize,
      fullWidth,
      fullHeight,
      isZooming
    };
    this.ctx.save();
    this.transformToItem(fullProps);
    this.renderBase(fullProps);
    this.renderText(fullProps);
    const visibleOpacity = this.renderImageAnimate(fullProps);
    if (props.selected) {
      RecordControls.render(fullProps);
    }
    this.ctx.restore();
    return visibleOpacity;
  },
  renderBase: function({
    x,
    y,
    width,
    height,
    borderSize,
    fullWidth,
    fullHeight,
    color,
    selected
  }) {
    if (!fullWidth || !fullHeight) {
      return;
    }
    this.ctx.strokeStyle = selected ? "#aaf" : "#ddd";
    this.ctx.fillStyle = selected ? "#ccf" : "#fff";
    const xCorner = x - fullWidth / 2;
    const yCorner = y - fullHeight / 2;
    this.draw(this.ctx.fillRect, xCorner, yCorner, fullWidth, fullHeight);
    this.draw(this.ctx.strokeRect, xCorner, yCorner, fullWidth, fullHeight);
    this.ctx.fillStyle = color || "#000";
    this.draw(
      this.ctx.fillRect,
      xCorner + borderSize,
      yCorner + borderSize,
      width,
      height
    );
  },
  renderText: function({
    x,
    y,
    width,
    height,
    fullHeight,
    caption,
    type,
    border,
    borderSize,
    isZooming
  }) {
    if (!border) {
      return;
    }
    if (type === "collection") {
      caption = "[ " + caption + " ]";
    }
    if (type === "follow") {
      caption = "@" + caption;
    }
    const bottomBorderHeight = fullHeight - height - borderSize;
    const fontHeight = 0.5 * bottomBorderHeight;
    const xpos = x;
    const ypos = y + 0.5 * fullHeight - (bottomBorderHeight - fontHeight) * 0.4;
    this.ctx.fillStyle = "#333";
    this.ctx.font = `${fontHeight}px American Typewriter, Courier New, sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "bottom";
    if (!isZooming) {
      this.ctx.fillText(caption, xpos, ypos, width);
    } else {
      const textWidth = Math.min(this.ctx.measureText(caption).width, width);
      this.ctx.fillStyle = "#bbb";
      this.draw(
        this.ctx.fillRect,
        xpos - textWidth / 2,
        ypos - fontHeight,
        textWidth,
        fontHeight
      );
    }
  },
  loadImage: function(props) {
    const cachedImage = imgCache[props.type + props.id];
    if (cachedImage) {
      if (
        cachedImage.width !== props.width ||
        cachedImage.height !== props.height
      ) {
        props.onUpdateItemProps(props.id, {
          width: cachedImage.width,
          height: cachedImage.height
        });
      }
      return;
    }
    if (imgLoading) {
      imgQueue.push(this.loadImage.bind(this, props));
      return;
    }
    imgLoading = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.addEventListener(
      "load",
      () => {
        imgLoading = false;
        const color = props.color || this.getDominantColor(img);
        const scale = props.scale === undefined ? 1 : props.scale;
        props.onUpdateItemProps(props.id, {
          width: img.width,
          height: img.height,
          color: color,
          scale: scale
        });
        img.alpha = 0;
        if (imgQueue.length > 0) {
          imgQueue.pop().call();
        }
        imgCache[props.type + props.id] = img;
      },
      false
    );
    img.onerror = () => {
      imgLoading = false;
      img.alpha = 0;
      if (imgQueue.length > 0) {
        imgQueue.pop().call();
      }
    };
    img.src = props.src;
  },
  renderImageAnimate: function(props) {
    const img = imgCache[props.type + props.id];
    if (!img) {
      return;
    }
    if (props.isZooming) {
      img.alpha = 0;
      return;
    }
    let visibleOpacity;
    visibleOpacity = this.renderImage(img, props);
    if (img.alpha < 1) {
      img.alpha += props.isZooming ? 0.05 : 0.01;
    }
    return visibleOpacity;
  },
  renderImage: function(img, props) {
    if (!img.width || !img.height) {
      return;
    }
    const visibleOpacity = this.getVisibleOpacity(
      img.width,
      props.scale,
      props.canvasScale
    );
    const imgAlpha = img.alpha || 0;
    if (visibleOpacity > 0 && !props.isZooming) {
      this.ctx.globalAlpha = Math.min(imgAlpha, visibleOpacity);
      const xCorner = props.x - props.width / 2;
      const yCorner =
        props.y -
        props.height / 2 -
        (BOTTOM_BORDER_FACTOR * props.borderSize) / 2;
      this.ctx.drawImage(img, xCorner, yCorner);
      this.ctx.globalAlpha = 1.0;
    }
    return imgAlpha;
  },
  computeBorderSize: function({ width, height, border }) {
    const borderSize = border ? 0.025 * Math.min(width, height) : 0;
    const fullWidth = width + 2 * borderSize;
    const fullHeight = height + (2 + BOTTOM_BORDER_FACTOR) * borderSize;
    return { borderSize, fullWidth, fullHeight };
  },
  getTransformedDimensions: function(item) {
    const { fullWidth, fullHeight } = this.computeBorderSize(item);
    const width = fullWidth * item.scale;
    const height = fullHeight * item.scale;
    const x = item.x - fullWidth / 2 - (width - fullWidth) / 2;
    const y = item.y - fullHeight / 2 - (height - fullHeight) / 2;
    return { x, y, width, height };
  },
  getVisibleOpacity: function(width, scale, canvasScale, threshold = 50) {
    const factor = width * scale * canvasScale;
    const opacity = (factor - threshold) / (0.5 * threshold);
    return Math.max(0, Math.min(opacity, 1));
  },
  isPointInRecord: function(props) {
    const { borderSize, fullWidth, fullHeight } = this.computeBorderSize(props);
    const fullProps = {
      ...props,
      borderSize,
      fullWidth,
      fullHeight
    };
    this.ctx.save();
    this.transformToItem(fullProps);
    this.ctx.beginPath();
    const isPointInHandle = RecordControls.isPointInHandle(
      props.inputX,
      props.inputY,
      fullProps
    );
    let output;
    if (!props.skipCheckHandle && isPointInHandle) {
      output = "handle";
    } else {
      this.ctx.beginPath();
      this.draw(
        this.ctx.rect,
        props.x - fullWidth / 2,
        props.y - fullHeight / 2,
        fullWidth,
        fullHeight
      );
      output = this.ctx.isPointInPath(props.inputX, props.inputY)
        ? "record"
        : false;
    }
    this.ctx.restore();
    return output;
  },
  computeTransformedDimensions: function(item, canvas) {
    const { fullWidth, fullHeight } = this.computeBorderSize(item);
    const xMin =
      item.x - 0.5 * fullWidth * item.scale + canvas.x / canvas.scale;
    const yMin =
      item.y - 0.5 * fullHeight * item.scale + canvas.y / canvas.scale;
    const xMax = xMin + fullWidth * item.scale;
    const yMax = yMin + fullHeight * item.scale;
    return { xMin, yMin, xMax, yMax };
  },
  isRecordEnclosed: function(item, canvas, x, y, w, h) {
    const { xMin, yMin, xMax, yMax } = this.computeTransformedDimensions(
      item,
      canvas
    );
    return xMin < x && xMax > x + w && yMin < y && yMax > y + h;
  },
  isRecordInViewport: function(item, canvas, x, y, w, h) {
    const { xMin, yMin, xMax, yMax } = this.computeTransformedDimensions(
      item,
      canvas
    );
    const isWithin =
      ((xMax > x && xMax < x + w) || (xMin > x && xMin < x + w)) &&
      ((yMax > y && yMax < y + h) || (yMin > y && yMin < y + h));
    const isEnclosed = this.isRecordEnclosed(item, canvas, x, y, w, h);
    return isWithin || isEnclosed;
  },
  draw: function(drawFn, x, y, width, height) {
    drawFn.call(this.ctx, x, y, width, height);
  },
  transformToItem: function({ x, y, scale, angle }) {
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-x, -y);
  },
  getDominantColor: function(img) {
    let tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    let tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) {
      return "#000";
    }
    tempCtx.drawImage(img, 0, 0, img.width, img.height);
    let data = tempCtx.getImageData(0, 0, img.width, img.height);
    const blockSize = 5;
    let i = -4;
    let count = 0;
    let red = 0,
      green = 0,
      blue = 0;
    let length = data.data.length;
    while ((i += blockSize * 4) < length) {
      ++count;
      red += data.data[i];
      green += data.data[i + 1];
      blue += data.data[i + 2];
    }
    red = ~~(red / count);
    green = ~~(green / count);
    blue = ~~(blue / count);
    tempCanvas = tempCtx = data = null;
    return this.rgbToHex(red, green, blue);
  },
  rgbToHex: function(red, green, blue) {
    var rgb = blue | (green << 8) | (red << 16);
    return "#" + rgb.toString(16);
  }
};

export default Record;

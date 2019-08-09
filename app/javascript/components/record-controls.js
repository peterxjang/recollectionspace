const RecordControls = {
  init: function(ctx) {
    this.ctx = ctx;
  },
  render: function({ x, y, fullWidth, fullHeight, scale, canvasScale }) {
    this.drawHandle(
      this.ctx.strokeRect,
      x - fullWidth / 2,
      y - fullHeight / 2,
      fullWidth,
      fullHeight,
      scale,
      canvasScale
    );
  },
  drawHandle: function(drawFn, x, y, width, height, scale, canvasScale) {
    const handleSize = 0.1 * width;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = 0.2 * handleSize;
    drawFn.call(
      this.ctx,
      x - handleSize / 2 + width,
      y - handleSize / 2 + height,
      handleSize,
      handleSize
    );
    this.ctx.lineWidth = 1;
  },
  isPointInHandle: function(
    inputX,
    inputY,
    x,
    y,
    width,
    height,
    scale,
    canvasScale
  ) {
    this.drawHandle(this.ctx.rect, x, y, width, height, scale, canvasScale);
    return this.ctx.isPointInPath(inputX, inputY);
  }
};

export default RecordControls;

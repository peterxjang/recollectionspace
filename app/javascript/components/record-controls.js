const RecordControls = {
  init: function(ctx) {
    this.ctx = ctx;
  },
  render: function({ x, y, fullWidth, fullHeight, scale }) {
    this.drawHandle(
      this.ctx.strokeRect,
      x - fullWidth / 2,
      y - fullHeight / 2,
      fullWidth,
      fullHeight,
      scale
    );
    this.drawEditButton(
      this.ctx.strokeRect,
      x - fullWidth / 2,
      y - fullHeight / 2,
      fullWidth,
      fullHeight,
      scale
    );
    this.drawDestroyButton(
      this.ctx.strokeRect,
      x - fullWidth / 2,
      y - fullHeight / 2,
      fullWidth,
      fullHeight,
      scale
    );
  },
  drawHandle: function(drawFn, x, y, width, height, scale) {
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
  drawEditButton: function(drawFn, x, y, width, height, scale) {
    const buttonSize = 0.25 * width;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = buttonSize / 10;
    drawFn.call(
      this.ctx,
      x - 0.5 * buttonSize + 0.25 * width,
      y - 0.5 * buttonSize + 0.5 * height,
      buttonSize,
      buttonSize
    );
    this.ctx.lineWidth = 1;
  },
  drawDestroyButton: function(drawFn, x, y, width, height, scale) {
    const buttonSize = 0.25 * width;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = buttonSize / 10;
    drawFn.call(
      this.ctx,
      x - 0.5 * buttonSize + 0.75 * width,
      y - 0.5 * buttonSize + 0.5 * height,
      buttonSize,
      buttonSize
    );
    this.ctx.lineWidth = 1;
  },
  isPointInHandle: function(inputX, inputY, x, y, width, height, scale) {
    this.drawHandle(this.ctx.rect, x, y, width, height, scale);
    return this.ctx.isPointInPath(inputX, inputY);
  }
};

export default RecordControls;

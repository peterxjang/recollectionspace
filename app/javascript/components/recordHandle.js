const RecordHandle = {
  init: function(ctx) {
    this.ctx = ctx;
  },
  render: function({ x, y, fullWidth, fullHeight, scale, canvasScale }) {
    this.draw(this.ctx.strokeRect, x - fullWidth / 2, y - fullHeight / 2, fullWidth, fullHeight, scale, canvasScale);
  },
  draw: function(drawFn, x, y, width, height, scale, canvasScale) {
    const handleSize = 50 / scale / canvasScale;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = 5 / scale / canvasScale;
    // drawFn.call(this.ctx, x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
    // drawFn.call(this.ctx, x - handleSize / 2 + width, y - handleSize / 2, handleSize, handleSize);
    // drawFn.call(this.ctx, x - handleSize / 2, y - handleSize / 2 + height, handleSize, handleSize);
    drawFn.call(this.ctx, x - handleSize / 2 + width, y - handleSize / 2 + height, handleSize, handleSize);
    this.ctx.lineWidth = 1;
  }
};

export default RecordHandle;

const RecordControls = {
  init: function(ctx) {
    this.ctx = ctx;
  },
  render: function(props) {
    this.drawHandle(this.ctx.strokeRect, props);
    this.drawEditButton(this.ctx.strokeRect, props);
    this.drawDestroyButton(this.ctx.strokeRect, props);
  },
  drawHandle: function(drawFn, props) {
    const handleSize = 0.1 * props.fullWidth;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = 0.2 * handleSize;
    drawFn.call(
      this.ctx,
      props.x + 0.5 * props.fullWidth - handleSize / 2,
      props.y + 0.5 * props.fullHeight - handleSize / 2,
      handleSize,
      handleSize
    );
    this.ctx.lineWidth = 1;
  },
  drawEditButton: function(drawFn, props) {
    const buttonSize = 0.25 * props.fullWidth;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = 0.2 * buttonSize;
    drawFn.call(
      this.ctx,
      props.x - 0.25 * props.fullWidth - 0.5 * buttonSize,
      props.y - 0.5 * buttonSize,
      buttonSize,
      buttonSize
    );
    this.ctx.lineWidth = 1;
  },
  drawDestroyButton: function(drawFn, props) {
    const buttonSize = 0.25 * props.fullWidth;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = 0.2 * buttonSize;
    drawFn.call(
      this.ctx,
      props.x + 0.25 * props.fullWidth - 0.5 * buttonSize,
      props.y - 0.5 * buttonSize,
      buttonSize,
      buttonSize
    );
    this.ctx.lineWidth = 1;
  },
  isPointInHandle: function(inputX, inputY, props) {
    this.drawHandle(this.ctx.rect, props);
    return this.ctx.isPointInPath(inputX, inputY);
  }
};

export default RecordControls;

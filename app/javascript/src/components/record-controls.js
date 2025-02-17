const RecordControls = {
  init: function(ctx) {
    this.ctx = ctx;
    this.imageEdit = new Image();
    this.imageEdit.src =
      "https://res.cloudinary.com/recollectionspace/image/upload/v1565711672/edit-icon.png";
    this.imageDestroy = new Image();
    this.imageDestroy.src =
      "https://res.cloudinary.com/recollectionspace/image/upload/v1565711727/destroy-icon.png";
  },
  render: function(props) {
    this.drawHandle(this.ctx.strokeRect, props);
    this.drawEditButton(this.ctx.strokeRect, props, true);
    this.drawDestroyButton(this.ctx.strokeRect, props, true);
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
  drawEditButton: function(drawFn, props, drawImage = false) {
    if (props.type !== "record") {
      return;
    }
    const buttonSize = 0.15 * props.fullWidth;
    const x = props.x + 0.5 * props.fullWidth - 2.5 * buttonSize;
    const y = props.y - 0.5 * props.fullHeight + 0.25 * buttonSize;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = 0;
    if (drawImage) {
      this.ctx.drawImage(this.imageEdit, x, y, buttonSize, buttonSize);
    } else {
      drawFn.call(this.ctx, x, y, buttonSize, buttonSize);
    }
  },
  drawDestroyButton: function(drawFn, props, drawImage = false) {
    const buttonSize = 0.15 * props.fullWidth;
    const x = props.x + 0.5 * props.fullWidth - 1.25 * buttonSize;
    const y = props.y - 0.5 * props.fullHeight + 0.25 * buttonSize;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = 0;
    if (drawImage) {
      this.ctx.drawImage(this.imageDestroy, x, y, buttonSize, buttonSize);
    } else {
      drawFn.call(this.ctx, x, y, buttonSize, buttonSize);
    }
  },
  drawBase: function(drawFn, props) {
    drawFn.call(
      this.ctx,
      props.x - props.fullWidth / 2,
      props.y - props.fullHeight / 2,
      props.fullWidth,
      props.fullHeight
    );
  },
  getTypeAtPoint: function(x, y, props) {
    this.ctx.beginPath();
    this.drawHandle(this.ctx.rect, props);
    const isPointInHandle = this.ctx.isPointInPath(x, y);
    if (props.selected && isPointInHandle) {
      return "handle";
    }
    this.ctx.beginPath();
    this.drawEditButton(this.ctx.rect, props);
    const isPointInEditButton = this.ctx.isPointInPath(x, y);
    if (props.selected && isPointInEditButton) {
      return "edit-button";
    }
    this.ctx.beginPath();
    this.drawDestroyButton(this.ctx.rect, props);
    const isPointInDestroyButton = this.ctx.isPointInPath(x, y);
    if (props.selected && isPointInDestroyButton) {
      return "destroy-button";
    }
    this.ctx.beginPath();
    this.drawBase(this.ctx.rect, props);
    const isPointInRecord = this.ctx.isPointInPath(x, y);
    if (isPointInRecord) {
      return "record";
    }
    return false;
  }
};

export default RecordControls;

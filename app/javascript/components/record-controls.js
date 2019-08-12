const RecordControls = {
  init: function(ctx) {
    this.ctx = ctx;
    this.imageEdit = new Image();
    this.imageEdit.src =
      "https://www.pngfind.com/pngs/m/70-704184_png-file-svg-pencil-edit-icon-png-transparent.png";
    this.imageDestroy = new Image();
    this.imageDestroy.src =
      "https://icon2.kisspng.com/20180604/uzx/kisspng-computer-icons-x-icon-5b15133351dc76.4903214215281078273353.jpg";
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
    const buttonSize = 0.25 * props.fullWidth;
    const x = props.x - 0.25 * props.fullWidth - 0.5 * buttonSize;
    const y = props.y - 0.5 * buttonSize;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = 0.2 * buttonSize;
    drawFn.call(this.ctx, x, y, buttonSize, buttonSize);
    if (drawImage) {
      this.ctx.drawImage(this.imageEdit, x, y, buttonSize, buttonSize);
    }
    this.ctx.lineWidth = 1;
  },
  drawDestroyButton: function(drawFn, props, drawImage = false) {
    const buttonSize = 0.25 * props.fullWidth;
    const x = props.x + 0.25 * props.fullWidth - 0.5 * buttonSize;
    const y = props.y - 0.5 * buttonSize;
    this.ctx.strokeStyle = "#00f";
    this.ctx.lineWidth = 0.2 * buttonSize;
    drawFn.call(this.ctx, x, y, buttonSize, buttonSize);
    if (drawImage) {
      this.ctx.drawImage(this.imageDestroy, x, y, buttonSize, buttonSize);
    }
    this.ctx.lineWidth = 1;
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

class Api::RecordsController < ApplicationController
  def create
    response = Cloudinary::Uploader.upload(Rails.root.join("public", "images", "2.jpg"))
    render json: {message: "Upload file", response: response}
    return
    @record = Record.new(
      name: params[:name],
      description: params[:description],
      collection_id: params[:collection_id],
      x: params[:x],
      y: params[:y],
      width: params[:width],
      height: params[:height],
      angle: params[:angle],
      scale: params[:scale],
      border: params[:border],
      src: params[:src],
      color: params[:color],
      zindex: params[:zindex]
    )
    if @record.save
      render "show.json.jb"
    else
      render json: {errors: @record.errors.full_messages}, status: 422
    end
  end

  def update
    @record = Record.find_by(id: params[:id])
    @record.name = params[:name] || @record.name
    @record.description = params[:description] || @record.description
    @record.collection_id = params[:collection_id] || @record.collection_id
    @record.x = params[:x] || @record.x
    @record.y = params[:y] || @record.y
    @record.width = params[:width] || @record.width
    @record.height = params[:height] || @record.height
    @record.angle = params[:angle] || @record.angle
    @record.scale = params[:scale] || @record.scale
    @record.border = params[:border] || @record.border
    @record.src = params[:src] || @record.src
    @record.color = params[:color] || @record.color
    @record.zindex = params[:zindex] || @record.zindex
    if @record.save
      render "show.json.jb"
    else
      render json: {errors: @record.errors.full_messages}, status: 422
    end
  end

  def destroy
    @record = Record.find_by(id: params[:id])
    @record.destroy
    render json: {message: "Record successfully destroyed!"}
  end
end

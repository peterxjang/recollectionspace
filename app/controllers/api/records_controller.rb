class Api::RecordsController < ApplicationController
  before_action :authenticate_user

  def create
    user_collection = UserCollection.find_by(id: params[:user_collection_id], user_id: current_user.id)
    if !user_collection
      render json: {errors: ["Invalid collection"]}, status: 422
      return
    end
    src = Cloudinary::Uploader.upload(params[:image])["secure_url"]
    @record = Record.new(
      name: params[:name],
      description: params[:description],
      user_collection_id: params[:user_collection_id],
      x: params[:x],
      y: params[:y],
      width: params[:width],
      height: params[:height],
      angle: params[:angle],
      scale: params[:scale],
      border: params[:border],
      src: src,
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
    if @record && @record.user_collection.user_id != current_user.id
      render json: {errors: ["Invalid collection"]}, status: 422
      return
    end
    @record.name = params[:name] || @record.name
    @record.description = params[:description] || @record.description
    @record.user_collection_id = params[:user_collection_id] || @record.user_collection_id
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
    if @record && @record.user_collection.user_id != current_user.id
      render json: {errors: ["Invalid collection"]}, status: 422
      return
    end
    @record.destroy
    render json: {message: "Record successfully destroyed!"}
  end
end

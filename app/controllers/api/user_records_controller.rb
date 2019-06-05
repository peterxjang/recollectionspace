class Api::UserRecordsController < ApplicationController
  before_action :authenticate_user

  def create
    user_collection = UserCollection.find_by(id: params[:user_collection_id], user_id: current_user.id)
    if !user_collection
      render json: {errors: ["Invalid collection"]}, status: 422
      return
    end
    src = Cloudinary::Uploader.upload(params[:image])["secure_url"]
    @user_record = UserRecord.new(
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
    if @user_record.save
      render "show.json.jb"
    else
      render json: {errors: @user_record.errors.full_messages}, status: 422
    end
  end

  def update
    @user_record = UserRecord.find_by(id: params[:id])
    if @user_record && @user_record.user_collection.user_id != current_user.id
      render json: {errors: ["Invalid collection"]}, status: 422
      return
    end
    @user_record.name = params[:name] || @user_record.name
    @user_record.description = params[:description] || @user_record.description
    @user_record.user_collection_id = params[:user_collection_id] || @user_record.user_collection_id
    @user_record.x = params[:x] || @user_record.x
    @user_record.y = params[:y] || @user_record.y
    @user_record.width = params[:width] || @user_record.width
    @user_record.height = params[:height] || @user_record.height
    @user_record.angle = params[:angle] || @user_record.angle
    @user_record.scale = params[:scale] || @user_record.scale
    @user_record.border = params[:border] || @user_record.border
    @user_record.src = params[:src] || @user_record.src
    @user_record.color = params[:color] || @user_record.color
    @user_record.zindex = params[:zindex] || @user_record.zindex
    if @user_record.save
      render "show.json.jb"
    else
      render json: {errors: @user_record.errors.full_messages}, status: 422
    end
  end

  def destroy
    @user_record = UserRecord.find_by(id: params[:id])
    if @user_record && @user_record.user_collection.user_id != current_user.id
      render json: {errors: ["Invalid collection"]}, status: 422
      return
    end
    @user_record.destroy
    render json: {message: "Record successfully destroyed!"}
  end
end

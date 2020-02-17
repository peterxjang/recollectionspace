class Api::UserRecordsController < ApplicationController
  before_action :authenticate_user

  def create
    user_collection = UserCollection.find_by(id: params[:user_collection_id], user_id: current_user.id)
    if !user_collection
      render json: {errors: ["Invalid collection"]}, status: 422
      return
    end
    record = params[:api_id] ? Record.find_by(api_id: params[:api_id], collection_id: user_collection.collection.id) : nil
    if record && UserRecord.find_by(record_id: record.id)
      render json: {errors: ["Record already exists"]}, status: 422
      return
    end
    unless record
      unless params[:image]
        render json: {errors: ["Invalid image"]}, status: 422
        return
      end
      response = Cloudinary::Uploader.upload(params[:image], folder: "records")
      record = Record.new(
        api_id: params[:api_id],
        collection_id: user_collection.collection.id,
        src: response["secure_url"],
        width: response["width"],
        height: response["height"],
        color: params[:color],
        name: params[:name],
        description: params[:description],
      )
      unless record.save
        render json: {errors: record.errors.full_messages}, status: 422
        return
      end
    end
    options = get_valid_options(params, user_collection, record.width || params[:width].to_i)
    @user_record = UserRecord.new(
      record_id: record.id,
      name: record.name || params[:name],
      description: record.description || params[:description],
      user_collection_id: params[:user_collection_id],
      x: options[:x],
      y: options[:y],
      width: record.width || params[:width],
      height: record.height || params[:height],
      angle: options[:angle],
      scale: options[:scale].to_f * (record.width || params[:width]).to_i / record.width.to_f,
      border: options[:border],
      src: record.src,
      color: record.color || options[:color],
      zindex: options[:zindex]
    )
    if @user_record.save
      render "show.json.jb"
    else
      render json: {errors: @user_record.errors.full_messages}, status: 422
    end
  end

  def update
    @user_record = UserRecord.find_by(id: params[:id])
    if !@user_record
      render json: {errors: ["Invalid user record"]}, status: 422
      return
    end
    if @user_record && @user_record.user_collection.user_id != current_user.id
      render json: {errors: ["Unauthorized collection"]}, status: :unauthorized
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
    record = @user_record.record
    @user_record.destroy
    if !record.api_id && record.user_records.length == 0
      record.destroy
    end
    render json: {message: "Record successfully destroyed!"}
  end

  private

  def get_valid_options(input_params, user_collection, width)
    options = {
      angle: 0,
      border: true,
      color: "#000",
      zindex: 1
    }
    if input_params[:x]
      options[:x] = input_params[:x]
      options[:y] = input_params[:y]
      options[:angle] = input_params[:angle]
      options[:scale] = input_params[:scale]
      options[:border] = input_params[:border]
      options[:color] = input_params[:color]
      options[:zindex] = input_params[:zindex]
    elsif user_collection.user_records.length > 0
      xcoords = user_collection.user_records
        .map { |ur| ur.x }
      ycoords = user_collection.user_records
        .map { |ur| ur.y }
      xspan = xcoords.max - xcoords.min

      options[:x] = xcoords
        .reduce(0) { |sum, x| sum + x } / xcoords.length
      options[:y] = ycoords
        .reduce(0) { |sum, y| sum + y } / ycoords.length
      options[:scale] = 0.5 * xspan / width
    end
    options
  end
end

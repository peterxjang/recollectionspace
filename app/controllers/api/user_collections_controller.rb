class Api::UserCollectionsController < ApplicationController
  before_action :authenticate_user, except: [:index, :show]

  def index
    @parent = Follow.find_by(follower_id: current_user.id, following_id: current_user.id)
    @parent_type = "follow"
    @children = @parent.following.user_collections
    @children_type = "collection"
    @is_owner = true
    render "index.json.jb"
  end

  def create
    collection = Collection.find_by(id: params[:collection_id])
    if !collection
      unless params[:caption] && params[:image]
        render json: {errors: ["Invalid collection"]}, status: 422
        return
      end
      unless current_user.admin
        render json: {errors: ["You must be an admin to create a new collection."]}, status: 422
        return
      end
      response = Cloudinary::Uploader.upload(params[:image], folder: "collections")
      src = response["secure_url"]
      width = response["width"]
      height = response["height"]
      collection = Collection.new(
        name: params[:caption],
        src: src,
        width: width,
        height: height,
        color: params[:color]
      )
      unless collection.save
        render json: {errors: collection.errors.full_messages}, status: 422
        return
      end
    end
    src = collection.src
    width = collection.width
    height = collection.height
    @user_collection = UserCollection.new(
      user_id: current_user.id,
      collection_id: collection.id,
      x: params[:x],
      y: params[:y],
      width: width,
      height: height,
      angle: params[:angle],
      scale: params[:scale].to_f * params[:width].to_i / width.to_f,
      border: params[:border],
      src: src,
      color: params[:color] || collection.color,
      zindex: params[:zindex]
    )
    if @user_collection.save
      render "show.json.jb", status: :created
    else
      render json: {errors: @user_collection.errors.full_messages}, status: 422
    end
  end

  def show
    if params[:id] == "search"
      user = User.find_by(username: params[:username])
      if user
        user_collections = user.user_collections.select { |user_collection| user_collection.name.parameterize == params[:collection_name] }
        if user_collections.length > 0
          @parent = user_collections[0]
        end
      end
    else
      @parent = UserCollection.find_by(id: params[:id])
    end
    if @parent
      @parent_type = "collection"
      @children = @parent.user_records
      @children_type = "record"
      @client_url = "/#{@parent.user.username}/#{@parent.name.parameterize}"
      @is_owner = @parent.user == current_user
      render "index.json.jb"
    else
      render json: {errors: ["Invalid parameters"]}, status: :bad_request
    end
  end

  def update
    @user_collection = UserCollection.find_by(id: params[:id], user_id: current_user.id)
    if !@user_collection
      render json: {errors: ["Invalid collection"]}, status: 422
      return
    end
    @user_collection.x = params[:x] || @user_collection.x
    @user_collection.y = params[:y] || @user_collection.y
    @user_collection.width = params[:width] || @user_collection.width
    @user_collection.height = params[:height] || @user_collection.height
    @user_collection.angle = params[:angle] || @user_collection.angle
    @user_collection.scale = params[:scale] || @user_collection.scale
    @user_collection.border = params[:border] || @user_collection.border
    @user_collection.src = params[:src] || @user_collection.src
    @user_collection.color = params[:color] || @user_collection.color
    @user_collection.zindex = params[:zindex] || @user_collection.zindex
    if @user_collection.save
      render "show.json.jb"
    else
      render json: {errors: @user_collection.errors.full_messages}, status: 422
    end
  end

  def destroy
    @user_collection = UserCollection.find_by(id: params[:id], user_id: current_user.id)
    if !@user_collection
      render json: {errors: ["Invalid collection"]}, status: :bad_request
      return
    end
    @user_collection.destroy
    render json: {message: "Collection successfully destroyed!"}
  end
end

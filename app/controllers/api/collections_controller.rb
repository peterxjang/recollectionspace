class Api::CollectionsController < ApplicationController
  before_action :authenticate_user

  def index
    @parent = Follow.find_by(follower_id: current_user.id, following_id: current_user.id)
    @parent_type = "follow"
    @children = @parent.following.collections
    @children_type = "collection"
    render "index.json.jb"
  end

  def create
    response = Cloudinary::Uploader.upload(params[:image])
    @collection = Collection.new(
      user_id: current_user.id,
      collection_category_id: params[:collection_category_id],
      x: params[:x],
      y: params[:y],
      width: params[:width],
      height: params[:height],
      angle: params[:angle],
      scale: params[:scale],
      border: params[:border],
      src: response["secure_url"],
      color: params[:color],
      zindex: params[:zindex]
    )
    if @collection.save
      render "show.json.jb"
    else
      render json: {errors: @collection.errors.full_messages}, status: 422
    end
  end

  def show
    if params[:id] == "search"
      user = User.find_by(username: params[:username])
      if user
        collections = user.collections.select { |collection| collection.name.parameterize == params[:collection_name] }
        if collections.length > 0
          @parent = collections[0]
        end
      end
    else
      @parent = Collection.find_by(id: params[:id])
    end
    if @parent
      @parent_type = "collection"
      @children = @parent.records
      @children_type = "record"
      @client_url = "/#{@parent.user.username}/#{@parent.name.parameterize}"
      render "index.json.jb"
    else
      render json: {errors: ["Invalid parameters"]}, status: :bad_request
    end
  end

  def update
    @collection = Collection.find_by(id: params[:id])
    @collection.x = params[:x] || @collection.x
    @collection.y = params[:y] || @collection.y
    @collection.width = params[:width] || @collection.width
    @collection.height = params[:height] || @collection.height
    @collection.angle = params[:angle] || @collection.angle
    @collection.scale = params[:scale] || @collection.scale
    @collection.border = params[:border] || @collection.border
    @collection.src = params[:src] || @collection.src
    @collection.color = params[:color] || @collection.color
    @collection.zindex = params[:zindex] || @collection.zindex
    if @collection.save
      render "show.json.jb"
    else
      render json: {errors: @collection.errors.full_messages}, status: 422
    end
  end

  def destroy
    @collection = Collection.find_by(id: params[:id])
    @collection.destroy
    render json: {message: "Collection successfully destroyed!"}
  end
end

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
    @parent = Collection.find_by(id: params[:id])
    @parent_type = "collection"
    @children = @parent.records
    @children_type = "record"
    render "index.json.jb"
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
    matches = /^.+\.cloudinary\.com\/(?:[^\/]+\/)(?:(image|video)\/)?(?:(upload|fetch)\/)?(?:(?:[^_\/]+_[^,\/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^\.^\s]+)(?:\.(.+))?$/.match(@collection.src).to_a
    if matches.length == 6
      public_id = matches[4]
      result = Cloudinary::Uploader.destroy(public_id, options = {})
      p result
    end
    @collection.destroy
    render json: {message: "Collection successfully destroyed!"}
  end
end

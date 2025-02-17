class Api::UserCollectionsController < ApplicationController
  before_action :authenticate_user, except: [ :index, :show ]

  def index
    @parent = Follow.find_by(follower_id: current_user.id, following_id: current_user.id)
    @children = @parent.following.user_collections
    @is_owner = true
    render template: "api/canvas"
  end

  def create
    collection = Collection.find_by(id: params[:collection_id])
    unless collection
      render json: { errors: [ "Invalid collection" ] }, status: 422
      return
    end
    @user_collection = UserCollection.new(
      user_id: current_user.id,
      collection_id: collection.id,
      x: params[:x],
      y: params[:y],
      width: collection.width,
      height: collection.height,
      angle: params[:angle],
      scale: params[:scale].to_f * params[:width].to_i / collection.width.to_f,
      border: params[:border],
      src: collection.src,
      color: params[:color] || collection.color,
      zindex: params[:zindex],
    )
    if @user_collection.save
      render :show, status: :created
    else
      render json: { errors: @user_collection.errors.full_messages }, status: 422
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
      @children = @parent.user_records
      @is_owner = @parent.user == current_user
      render template: "api/canvas"
    else
      render json: { errors: [ "Invalid parameters" ] }, status: :bad_request
    end
  end

  def update
    @user_collection = UserCollection.find_by(id: params[:id], user_id: current_user.id)
    if !@user_collection
      render json: { errors: [ "Invalid collection" ] }, status: 422
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
      render :show
    else
      render json: { errors: @user_collection.errors.full_messages }, status: 422
    end
  end

  def destroy
    @user_collection = UserCollection.find_by(id: params[:id], user_id: current_user.id)
    if !@user_collection
      render json: { errors: [ "Invalid collection" ] }, status: :bad_request
      return
    end
    @user_collection.destroy
    render json: { message: "Collection successfully destroyed!" }
  end
end

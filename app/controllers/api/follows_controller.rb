class Api::FollowsController < ApplicationController
  before_action :authenticate_user

  def index
    @parent = current_user
    @parent_type = "root"
    @children = current_user.following_relationships
    @children_type = "follow"
    @client_url = "/"
    render "index.json.jb"
  end

  def create
    @follow = Follow.new(
      follower_id: current_user.id,
      following_id: params[:following_id],
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
    if @follow.save
      render "show_follow.json.jb"
    else
      render json: {errors: @follow.errors.full_messages}, status: 422
    end
  end

  def show
    @parent = Follow.find_by(id: params[:id])
    @parent_type = "follow"
    @children = @parent.following.collections
    @children_type = "collection"
    @client_url = "/#{@parent.following.username}"
    render "show.json.jb"
  end

  def update
    @follow = Follow.find_by(id: params[:id])
    @follow.x = params[:x] || @follow.x
    @follow.y = params[:y] || @follow.y
    @follow.width = params[:width] || @follow.width
    @follow.height = params[:height] || @follow.height
    @follow.angle = params[:angle] || @follow.angle
    @follow.scale = params[:scale] || @follow.scale
    @follow.border = params[:border] || @follow.border
    @follow.src = params[:src] || @follow.src
    @follow.color = params[:color] || @follow.color
    @follow.zindex = params[:zindex] || @follow.zindex
    if @follow.save
      render "show_follow.json.jb"
    else
      render json: {errors: @follow.errors.full_messages}, status: 422
    end
  end

  def destroy
    @follow = Follow.find_by(id: params[:id])
    unless @follow.follower_id == current_user.id && @follow.following_id == current_user.id
      @follow.destroy
      render json: {message: "Follow successfully destroyed!"}
    else
      render json: {errors: ["Cannot unfollow yourself"]}, status: 422
    end
  end
end

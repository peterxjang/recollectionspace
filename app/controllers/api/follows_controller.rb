class Api::FollowsController < ApplicationController
  before_action :authenticate_user

  def index
    @parent = current_user
    @parent_type = "root"
    @children = current_user.following_relationships
    @children_type = "follow"
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
    render "show.json.jb"
  end

  def destroy
    @follow = Follow.find_by(id: params[:id])
    @follow.destroy
    render json: {message: "Follow successfully destroyed!"}
  end
end

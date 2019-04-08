class Api::FollowsController < ApplicationController
  before_action :authenticate_user

  def index
    @parent = current_user
    @parent_type = "root"
    @children = current_user.following_relationships
    @children_type = "follow"
    render "index.json.jb"
  end

  def show
    @parent = Follow.find_by(id: params[:id])
    @parent_type = "follow"
    @children = @parent.following.collections
    @children_type = "collection"
    render "show.json.jb"
  end
end

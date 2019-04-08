class Api::CollectionsController < ApplicationController
  before_action :authenticate_user

  def index
    @parent = Follow.find_by(follower_id: current_user.id, following_id: current_user.id)
    @parent_type = "follow"
    @children = @parent.following.collections
    @children_type = "collection"
    render "index.json.jb"
  end

  def show
    @parent = Collection.find_by(id: params[:id])
    @parent_type = "collection"
    @children = @parent.records
    @children_type = "record"
    render "index.json.jb"
  end
end

class Api::CollectionsController < ApplicationController
  # before_action :authenticate_user

  def index
    current_user = User.second

    @parent = Follow.find_by(follower_id: current_user.id, following_id: current_user.id)
    @children = @parent.following.collections
    render "index.json.jb"
  end
end

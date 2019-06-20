class UserRecordsController < ApplicationController
  def new
    @username = params[:username]
    @collection_name = params[:collection_name]
    user = User.find_by(username: params[:username])
    if user == current_user
      user_collections = user.user_collections.select { |user_collection| user_collection.name.parameterize == params[:collection_name] }
      if user_collections.length > 0
        @collection_id = user_collections[0].id
        render "new.html.erb", layout: "record_new"
        return
      end
    end
    redirect_to "/"
  end
end

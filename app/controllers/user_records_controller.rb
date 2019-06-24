class UserRecordsController < ApplicationController
  def new
    @username = params[:username]
    @collection_name = params[:collection_name]
    user = User.find_by(username: params[:username])
    if user == current_user
      user_collections = user.user_collections.select { |user_collection| user_collection.name.parameterize == params[:collection_name] }
      if user_collections.length > 0
        @collection_id = user_collections[0].id
        @user_record = UserRecord.new
        render "new.html.erb", layout: "record_new"
        return
      end
    end
    redirect_to "/"
  end

  def edit
    @username = params[:username]
    @collection_name = params[:collection_name]
    @user_record_id = params[:user_record_id]
    user = User.find_by(username: params[:username])
    if user == current_user
      user_collections = user.user_collections.select { |user_collection| user_collection.name.parameterize == params[:collection_name] }
      if user_collections.length > 0
        user_collection = user_collections[0]
        @collection_id = user_collection.id
        @user_record = user_collection.user_records.find_by(id: @user_record_id)
        if @user_record
          render "edit.html.erb", layout: "record_new"
          return
        end
      end
    end
    redirect_to "/"
  end
end

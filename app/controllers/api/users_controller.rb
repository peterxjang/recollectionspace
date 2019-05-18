class Api::UsersController < ApplicationController
  def index
    @users = User.all
    if params[:username]
      @users = @users.where("username ILIKE ?", "%#{params[:username]}%")
    end
    if params[:new]
      @users = @users.select { |user| current_user.followings.exclude?(user) }
    end
    render "index.json.jb"
  end

  def create
    user = User.new(
      username: params[:username],
      email: params[:email],
      password: params[:password],
      password_confirmation: params[:password_confirmation],
      first_name: params[:first_name],
      last_name: params[:last_name],
      avatar: params[:avatar],
    )
    if user.save
      render json: {message: 'User created successfully'}, status: :created
    else
      render json: {errors: user.errors.full_messages}, status: :bad_request
    end
  end

  def show
    user = User.find_by(username: params[:username])
    if user
      @parent = Follow.find_by(follower_id: user.id, following_id: user.id)
      @parent_type = "follow"
      @children = user.collections
      @children_type = "collection"
      render "show.json.jb"
    else
      render json: {errors: ["Invalid username"]}, status: :bad_request
    end
  end
end

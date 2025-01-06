class Api::SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:password])
      session[:user_id] = user.id
      render json: { message: "Successfully logged in" }
    else
      render json: {}, status: :unauthorized
    end
  end

  def destroy
    session[:user_id] = nil
    render json: { message: "Successfully logged out" }
  end
end

class SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to "/"
    else
      @errors = ["Invalid email or password"]
      render "pages/home.html.erb", layout: false
    end
  end
end

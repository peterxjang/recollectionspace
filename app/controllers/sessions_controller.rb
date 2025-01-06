class SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to "/"
    else
      @errors = [ "Invalid email or password" ]
      render template: "pages/home", layout: "home"
    end
  end
end

class ApplicationController < ActionController::Base
  allow_browser versions: :modern
  protect_from_forgery with: :exception

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  helper_method :current_user

  def authenticate_user
    unless current_user
      render json: { errors: [ "Permission denied." ] }, status: :unauthorized
    end
  end

  def authenticate_admin
    unless current_user && current_user.admin
      render json: { errors: [ "Permission denied." ] }, status: :unauthorized
    end
  end
end

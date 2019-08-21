class PagesController < ApplicationController
  def home
    if current_user
      render "main.html.erb"
    else
      render "home.html.erb", layout: false
    end
  end

  def main
    render "main.html.erb"
  end
end

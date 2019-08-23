class PagesController < ApplicationController
  def home
    if current_user
      render "main.html.erb"
    else
      render "home.html.erb", layout: "home"
    end
  end

  def main
    render "main.html.erb"
  end
end

class PagesController < ApplicationController
  def home
    if current_user
      render :main
    else
      render :home, layout: "home"
    end
  end

  def main
    render :main
  end
end

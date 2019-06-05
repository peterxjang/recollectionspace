class Api::MoviesController < ApplicationController
  def index
    query = URI.encode params[:q]
    api_key = Rails.application.credentials.themoviedb[:api_key]
    response = HTTP.get("https://api.themoviedb.org/3/search/movie?query=#{query}&api_key=#{api_key}")
    data = response.parse["results"].map do |result|
      {
        id: result["id"],
        caption: result["original_title"],
        body: result["overview"],
        image: "http://image.tmdb.org/t/p/w300/#{result["poster_path"]}"
      }
    end
    render json: data
  end
end

class Api::RecordsController < ApplicationController
  def search_books
    query = URI.encode params[:q]
    response = HTTP.get("http://openlibrary.org/search.json?title=#{query}")
    data = []
    response.parse(:json)["docs"].each do |doc|
      if doc["ia"]
        doc["ia"].each do |id|
          data << {
            id: id,
            caption: doc["title"],
            image: "https://archive.org/services/img/#{id}",
            body: ""
          }
        end
      end
    end
    render json: data.first(5)
  end

  def search_movies
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

  def search_music
    query = URI.encode params[:q]
    response = HTTP.get("http://musicbrainz.org/ws/2/release/?query=#{query}&fmt=json")
    data = response.parse["releases"].map do |result|
      {
        id: result["id"],
        caption: result["title"],
        body: result["artist-credit"].map { |artist| artist["artist"]["name"] }.join(", "),
        image: "http://coverartarchive.org/release/#{result["id"]}/front"
      }
    end
    render json: data.first(5)
  end
end

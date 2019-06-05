class Api::BooksController < ApplicationController
  def index
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
end

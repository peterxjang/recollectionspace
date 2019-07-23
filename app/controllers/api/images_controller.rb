class Api::ImagesController < ApplicationController
  def create
    response = Cloudinary::Uploader.upload(params[:image], folder: "images")
    render json: {url: response["secure_url"]}
  end
end

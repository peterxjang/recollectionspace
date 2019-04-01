class Api::RecordsController < ApplicationController
  def create
    @record = Record.new(
      name: params[:name],
      description: params[:description],
      collection_id: params[:collection_id],
      x: params[:x],
      y: params[:y],
      width: params[:width],
      height: params[:height],
      angle: params[:angle],
      scale: params[:scale],
      border: params[:border],
      src: params[:src],
      color: params[:color],
      zindex: params[:zindex]
    )
    if @record.save
      render "show.json.jb"
    else
      render json: {errors: @record.errors.full_messages}, status: 422
    end
  end
end

class Api::CollectionsController < ApplicationController
  before_action :authenticate_admin, except: [:index]

  def index
    @collections = Collection.where(public: true)
    if params[:name]
      @collections = @collections.where("name ILIKE ?", "%#{params[:name]}%")
    end
    current_user_collection_ids = current_user.user_collections.pluck(:collection_id)
    @collections = @collections.where.not(id: current_user_collection_ids)
    @collections = @collections.limit(5)
    render "index.json.jb"
  end

  def create
    @collection = Collection.new(
      name: params[:caption],
      image: params[:image],
      src: params[:src],
      width: params[:width],
      height: params[:height],
      color: params[:color]
    )
    if @collection.save
      render "show.json.jb"
    else
      render json: {errors: @collection.errors.full_messages}, status: 422
    end
  end
end

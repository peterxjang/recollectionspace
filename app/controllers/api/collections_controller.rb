class Api::CollectionsController < ApplicationController
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
end

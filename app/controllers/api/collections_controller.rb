class Api::CollectionsController < ApplicationController
  def index
    @collections = Collection.all
    if params[:public]
      @collections = @collections.where(public: true)
    end
    current_user_collection_ids = current_user.user_collections.pluck(:collection_id)
    @collections = @collections.reject do |collection|
      current_user_collection_ids.include? collection.id
    end
    render "index.json.jb"
  end
end

class Api::CollectionCategoriesController < ApplicationController
  def index
    @collection_categories = CollectionCategory.all
    if params[:public]
      @collection_categories = @collection_categories.where(public: true)
    end
    current_user_collection_category_ids = current_user.collections.pluck(:collection_category_id)
    @collection_categories = @collection_categories.reject do |collection_category|
      current_user_collection_category_ids.include? collection_category.id
    end
    render "index.json.jb"
  end
end

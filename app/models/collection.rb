class Collection < ApplicationRecord
  belongs_to :collection_category
  belongs_to :user
  has_many :records

  def name
    collection_category.name
  end

  def description
    collection_category.description
  end
end

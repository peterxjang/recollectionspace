class Collection < ApplicationRecord
  validates :name, uniqueness: true

  has_many :user_collections
  has_many :records
end

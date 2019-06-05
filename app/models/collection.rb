class Collection < ApplicationRecord
  has_many :user_collections
  has_many :records
end

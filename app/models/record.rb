class Record < ApplicationRecord
  belongs_to :collection
  has_many :user_records
end

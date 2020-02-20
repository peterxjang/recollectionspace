class Collection < ApplicationRecord
  attribute :image

  before_validation :upload_image

  validates :name, presence: true, uniqueness: true
  validates :src, presence: true

  has_many :user_collections
  has_many :records

  private

  def upload_image
    if !src && image
      response = Cloudinary::Uploader.upload(image, folder: "collections")
      self.src = response["secure_url"]
      self.width = response["width"]
      self.height = response["height"]
    end
  end
end

class Collection < ApplicationRecord
  belongs_to :collection_category
  belongs_to :user
  has_many :records, :dependent => :destroy
  before_destroy :delete_cloudinary_image

  def name
    collection_category.name
  end

  def description
    collection_category.description
  end

  private
  # TODO: DRY with helper or concern
  def delete_cloudinary_image
    matches = /^.+\.cloudinary\.com\/(?:[^\/]+\/)(?:(image|video)\/)?(?:(upload|fetch)\/)?(?:(?:[^_\/]+_[^,\/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^\.^\s]+)(?:\.(.+))?$/.match(self.src).to_a
    if matches.length == 6
      public_id = matches[4]
      Cloudinary::Uploader.destroy(public_id, options = {})
    end
  end
end

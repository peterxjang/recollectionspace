class UserRecord < ApplicationRecord
  belongs_to :record
  belongs_to :user_collection
  before_destroy :delete_cloudinary_image

  private
  def delete_cloudinary_image
    return unless self.src && self.src != record.src
    matches = /^.+\.cloudinary\.com\/(?:[^\/]+\/)(?:(image|video)\/)?(?:(upload|fetch)\/)?(?:(?:[^_\/]+_[^,\/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^\.^\s]+)(?:\.(.+))?$/.match(self.src).to_a
    if matches.length == 6
      public_id = matches[4]
      Cloudinary::Uploader.destroy(public_id, options = {})
    end
  end
end

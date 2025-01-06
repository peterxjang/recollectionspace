class UserCollection < ApplicationRecord
  belongs_to :collection
  belongs_to :user
  has_many :user_records, dependent: :destroy
  before_destroy :delete_cloudinary_image

  def name
    collection.name
  end

  def description
    collection.description
  end

  def body
    description
  end

  def type
    "collection"
  end

  def client_url
    "/#{user.username}/#{name.parameterize}"
  end

  def slug_id
    "#{id}-#{name.parameterize}"
  end

  private

  # TODO: DRY with helper or concern
  def delete_cloudinary_image
    return unless self.src && self.src != collection.src
    matches = /^.+\.cloudinary\.com\/(?:[^\/]+\/)(?:(image|video)\/)?(?:(upload|fetch)\/)?(?:(?:[^_\/]+_[^,\/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^\.^\s]+)(?:\.(.+))?$/.match(self.src).to_a
    if matches.length == 6
      public_id = matches[4]
      Cloudinary::Uploader.destroy(public_id, options = {})
    end
  end
end

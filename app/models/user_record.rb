class UserRecord < ApplicationRecord
  belongs_to :record
  belongs_to :user_collection
  validates :name, presence: true
  before_destroy :delete_cloudinary_image
  before_save :assign_rendered_description, if: -> { description_changed? }

  def type
    "record"
  end

  def body
    rendered_description || description
  end

  def slug_id
    "#{id}-#{name.parameterize}"
  end

  def self.markdown
    Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true, safe_links_only: true, escape_html: true, fenced_code_blocks: true)
  end

  private
  def delete_cloudinary_image
    return unless self.src && self.src != record.src
    matches = /^.+\.cloudinary\.com\/(?:[^\/]+\/)(?:(image|video)\/)?(?:(upload|fetch)\/)?(?:(?:[^_\/]+_[^,\/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^\.^\s]+)(?:\.(.+))?$/.match(self.src).to_a
    if matches.length == 6
      public_id = matches[4]
      Cloudinary::Uploader.destroy(public_id, options = {})
    end
  end

  def assign_rendered_description
    assign_attributes(rendered_description: self.class.markdown.render(description))
  end
end

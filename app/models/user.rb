class User < ApplicationRecord
  has_secure_password
  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true

  has_many :follower_relationships, foreign_key: :following_id, class_name: "Follow"
  has_many :followers, through: :follower_relationships
  has_many :following_relationships, foreign_key: :follower_id, class_name: "Follow"
  has_many :followings, through: :following_relationships
  has_many :user_collections

  after_create :create_default_relationships

  private

  def create_default_relationships
    return if admin
    Follow.create!(follower_id: id, following_id: id, src: src, color: color, width: 1200, height: 800)
    collection = Collection.find_by(name: "music")
    collection
      .user_collections
      .create!(user_id: id, src: collection.src, width: collection.width, height: collection.height, color: collection.color, angle: 0.253, scale: 0.725, x: -153, y: -383)
    collection = Collection.find_by(name: "movies")
    collection
      .user_collections
      .create!(user_id: id, src: collection.src, width: collection.width, height: collection.height, color: collection.color, angle: 0, scale: 1.17, x: -2.44, y: 1011.9)
    collection = Collection.find_by(name: "books")
    collection
      .user_collections
      .create!(user_id: id, src: collection.src, width: collection.width, height: collection.height, color: collection.color, angle: -0.12, scale: 0.95, x: -1829.5, y: 293.5)
  end
end

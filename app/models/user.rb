class User < ApplicationRecord
  has_secure_password
  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true

  has_many :follower_relationships, foreign_key: :following_id, class_name: "Follow"
  has_many :followers, through: :follower_relationships
  has_many :following_relationships, foreign_key: :follower_id, class_name: "Follow"
  has_many :followings, through: :following_relationships
  has_many :collections

  after_create :create_default_relationships

  private

  def create_default_relationships
    Follow.create!(follower_id: id, following_id: id, color: "#111", src: src, width: 1200, height: 800)
    return if admin
    CollectionCategory.find_by(name: "Favorite Music")
      .collections
      .create!(user_id: id, width: 1920, height: 1280, color: "#421607", angle: 0, src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558926002/music.jpg")
    CollectionCategory.find_by(name: "Favorite Movies")
      .collections
      .create!(user_id: id, width: 1280, height: 720, color: "#421607", angle: 0, src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558927370/movies.jpg")
    CollectionCategory.find_by(name: "Favorite Books")
      .collections
      .create!(user_id: id, width: 1280, height: 853, color: "#421607", angle: 0, src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558928371/books.jpg")
  end
end

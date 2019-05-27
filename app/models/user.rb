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
    return if admin
    Follow.create!(follower_id: id, following_id: id, src: src, color: color, width: 1200, height: 800)
    CollectionCategory.find_by(name: "Favorite Music")
      .collections
      .create!(user_id: id, width: 1920, height: 1280, angle: 0.253, color: "#533323", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558926002/music.jpg", scale: 0.725, x: -153, y: -383)
    CollectionCategory.find_by(name: "Favorite Movies")
      .collections
      .create!(user_id: id, width: 1280, height: 720, angle: 0, color: "#000", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558927370/movies.jpg", scale: 1.17, x: -2.44, y: 1011.9)
    CollectionCategory.find_by(name: "Favorite Books")
      .collections
      .create!(user_id: id, width: 1280, height: 853, angle: -0.12, color: "#1d1612", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558928371/books.jpg", scale: 0.95, x: -1829.5, y: 293.5)
  end
end

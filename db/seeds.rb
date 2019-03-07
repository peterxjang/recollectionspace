User.create!(first_name: "admin", last_name: "admin", username: "admin", email: "admin@email.com", password: "password", admin: true)
User.create!(first_name: "Peter", last_name: "Jang", username: "peterxjang", email: "peter@email.com", password: "password")
User.create!(first_name: "Test", last_name: "Testerson", username: "test", email: "test@email.com", password: "password")
User.create!(first_name: "Saron", last_name: "Yitbarek", username: "saron", email: "saron@email.com", password: "password")

CollectionCategory.create!(user_id: 1, name: "Music", description: "Albums of music", public: true)
CollectionCategory.create!(user_id: 1, name: "Movies", description: "Full feature movies", public: true)
CollectionCategory.create!(user_id: 1, name: "Books", description: "Published works", public: true)
CollectionCategory.create!(user_id: 2, name: "About me", description: "Personal history")
CollectionCategory.create!(user_id: 2, name: "Code projects", description: "Programming portfolio")
CollectionCategory.create!(user_id: 2, name: "Writing", description: "Articles and blog posts I've written")
CollectionCategory.create!(user_id: 2, name: "Places I've been", description: "Cities I've traveled to")
CollectionCategory.create!(user_id: 2, name: "Art samples", description: "Drawings both analog and digital")

Follow.create!(follower_id: 1, following_id: 1)

Follow.create!(follower_id: 2, following_id: 2, x: -838.6, y: 901.4, angle: 0, scale: 0.5101, color: "#111")
Follow.create!(follower_id: 2, following_id: 3)
Follow.create!(follower_id: 2, following_id: 4)

Follow.create!(follower_id: 3, following_id: 3)
Follow.create!(follower_id: 3, following_id: 4)

Follow.create!(follower_id: 4, following_id: 4)
Follow.create!(follower_id: 4, following_id: 2)

# User.all.each do |user|
#   CollectionCategory.all.each do |collection_category|
#     collection = Collection.create!(user_id: user.id, collection_category_id: collection_category.id)
#     Record.create(collection_id: collection.id, name: "Test 1", description: "test description")
#     Record.create(collection_id: collection.id, name: "Test 2", description: "test description")
#     Record.create(collection_id: collection.id, name: "Test 3", description: "test description")
#   end
# end

# BOOKS
collection = Collection.create!(user_id: 2, collection_category_id: 3, x: 3778.1, y: -54.9, width: 1024, height: 682, color: "#421607", angle: 0, scale: 0.26476)
Record.create!(collection_id: collection.id)

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

Follow.create!(follower_id: 2, following_id: 2, x: -838.6, y: 901.4, angle: 0, scale: 0.5101, color: "#111", src: "default.jpg")
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
collection = Collection.create!(user_id: 2, collection_category_id: 3, x: 3778.1, y: -54.9, width: 1024, height: 682, color: "#421607", angle: 0, scale: 0.26476, src: "5.jpg")
Record.create!(collection_id: collection.id, name: "The Art of Game Design", x: 3774.3, y: -62.5, width: 355, height: 499, color: "#eac4ac", angle: 0, scale: 0.03808, src: "501.jpg")
Record.create!(collection_id: collection.id, name: "CSS Secrets", x: 3785, y: -62.9, width: 260, height: 317, color: "#e7e2e7", angle: 0, scale: 0.00105, src: "502.jpg")

# CODE PROJECTS
collection = Collection.create!(user_id: 2, collection_category_id: 5, x: 4141.8, y: -726.6, width: 1024, height: 786, color: "#2f54a8", angle: -0.093, scale: 0.92394, src: "2.jpg")
Record.create!(collection_id: collection.id, name: "AvsP video editor", x: 4034.8, y: -823.6, width: 458, height: 317, color: "#acbedb", angle: -0.093, scale: 0.38137, src: "201.png")
Record.create!(collection_id: collection.id, name: "DSNotes Homebrew", x: 4094.6, y: -659.6, width: 425, height: 427, color: "#c3c0be", angle: -0.093, scale: 0.24143, src: "202.jpg")
Record.create!(collection_id: collection.id, name: "HTML5 Canvas with Redux", x: 4276.5, y: -767.7, width: 932, height: 812, color: "#202021", angle: -0.093, scale: 0.22709, src: "206.jpg")

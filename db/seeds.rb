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

Follow.create!(follower_id: 2, following_id: 2, color: "#111", src: "/images/default.jpg", width: 1200, height: 800)
Follow.create!(follower_id: 2, following_id: 3)
Follow.create!(follower_id: 2, following_id: 4)

Follow.create!(follower_id: 3, following_id: 3)
Follow.create!(follower_id: 3, following_id: 4)

Follow.create!(follower_id: 4, following_id: 4)
Follow.create!(follower_id: 4, following_id: 2)

# BOOKS
collection = Collection.create!(user_id: 2, collection_category_id: 3, width: 1024, height: 682, color: "#421607", angle: 0, src: "/images/5.jpg")
Record.create!(collection_id: collection.id, name: "The Art of Game Design", width: 355, height: 499, color: "#eac4ac", src: "/images/501.jpg")
Record.create!(collection_id: collection.id, name: "CSS Secrets", width: 260, height: 317, color: "#e7e2e7", src: "/images/502.jpg")
Record.create!(collection_id: collection.id, name: "The Non-Designer's Design Book", width: 490, height: 700, color: "#626d69", src: "/images/503.jpg")
Record.create!(collection_id: collection.id, name: "Presentation Zen", width: 410, height: 500, color: "#7480ab", src: "/images/504.jpg")

# CODE PROJECTS
collection = Collection.create!(user_id: 2, collection_category_id: 5, width: 1024, height: 786, color: "#2f54a8", src: "/images/2.jpg")
Record.create!(collection_id: collection.id, name: "AvsP video editor", width: 458, height: 317, color: "#acbedb", src: "/images/201.png")
Record.create!(collection_id: collection.id, name: "DSNotes Homebrew", width: 425, height: 427, color: "#c3c0be", src: "/images/202.jpg")
Record.create!(collection_id: collection.id, name: "HTML5 Canvas with Redux", width: 932, height: 812, color: "#202021", src: "/images/206.jpg")
Record.create!(collection_id: collection.id, name: "QuickFits Rails application", width: 1428, height: 1230, color: "#797889", src: "/images/203.jpg")

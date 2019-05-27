User.create!(first_name: "admin", last_name: "admin", username: "admin", email: "admin@email.com", password: "password", admin: true)

CollectionCategory.create!(user_id: 1, name: "Favorite Music", description: "Albums of music", public: true)
CollectionCategory.create!(user_id: 1, name: "Favorite Movies", description: "Full feature movies", public: true)
CollectionCategory.create!(user_id: 1, name: "Favorite Books", description: "Published works", public: true)

User.create!(first_name: "Peter", last_name: "Jang", username: "peterxjang", email: "peter@email.com", password: "password", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558929196/peterxjang.jpg")
User.create!(first_name: "Test", last_name: "Testerson", username: "test", email: "test@email.com", password: "password", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558937260/test.jpg")
User.create!(first_name: "Saron", last_name: "Yitbarek", username: "saron", email: "saron@email.com", password: "password", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558937048/saron.jpg")

User.create!(first_name: "admin", last_name: "admin", username: "admin", email: "admin@email.com", password: "password", admin: true)

Collection.create!(name: "music", description: "Albums of music", width: 1920, height: 1280, color: "#533323", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558926002/music.jpg")
Collection.create!(name: "movies", description: "Full feature movies", width: 1280, height: 720, color: "#000", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558927370/movies.jpg")
Collection.create!(name: "books", description: "Published works", width: 1280, height: 853, color: "#1d1612", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558928371/books.jpg")

User.create!(first_name: "Peter", last_name: "Jang", username: "peterxjang", email: "peter@email.com", password: "password", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558929196/peterxjang.jpg", color: "#48474e", width: 1200, height: 800)
User.create!(first_name: "Test", last_name: "Testerson", username: "test", email: "test@email.com", password: "password", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558937260/test.jpg", color: "#396a6a", width: 1200, height: 800)
User.create!(first_name: "Saron", last_name: "Yitbarek", username: "saron", email: "saron@email.com", password: "password", src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558937048/saron.jpg", color: "#584d3e", width: 1200, height: 853)
User.create!(first_name: "Jay", last_name: "Wengrow", username: "jay", email: "jay@email.com", password: "password")
User.create!(first_name: "Fay", last_name: "Wengrow", username: "fay", email: "fay@email.com", password: "password")
User.create!(first_name: "Ray", last_name: "Wengrow", username: "ray", email: "ray@email.com", password: "password")
User.create!(first_name: "May", last_name: "Wengrow", username: "may", email: "may@email.com", password: "password")
User.create!(first_name: "Kay", last_name: "Wengrow", username: "kay", email: "kay@email.com", password: "password")

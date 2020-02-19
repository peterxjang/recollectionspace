require 'rails_helper'

RSpec.describe "Collections", type: :request do
  before :each do
    Collection.create!(name: "music", src: "image.jpg", width: 1, height: 1)
    Collection.create!(name: "movies", src: "image.jpg", width: 1, height: 1)
    Collection.create!(name: "books", src: "image.jpg", width: 1, height: 1)
    Collection.create!(name: "a", src: "image.jpg", width: 1, height: 1)
    Collection.create!(name: "b", src: "image.jpg", width: 1, height: 1)
    Collection.create!(name: "c", src: "image.jpg", width: 1, height: 1)
    Collection.create!(name: "d", src: "image.jpg", width: 1, height: 1)
    Collection.create!(name: "e", src: "image.jpg", width: 1, height: 1)
    Collection.create!(name: "f", src: "image.jpg", width: 1, height: 1)
    Collection.create!(name: "g", src: "image.jpg", width: 1, height: 1)
    user = User.create!(username: "a", email: "a@email.com", password: "password")
    stub_current_user(user)
  end

  describe "GET /api/collections" do
    it "gets an array of 5 unsubscribed collections" do
      get "/api/collections"
      collections = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(collections.length).to be <= 5
      expect(collections[0]).to match(hash_including(
        "id",
        "name",
        "description",
        "src",
        "width",
        "height"
      ))
    end
  end
end

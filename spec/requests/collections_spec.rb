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
    user = User.create!(username: "a", email: "a@email.com", password: "password", admin: true)
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

  describe "POST /api/collections" do
    it "creates a new collection given an src url" do
      post "/api/collections", params: {
        caption: "Test",
        src: "http://example.com/test.jpg",
        width: 100,
        height: 100,
        color: "#323"
      }
      json = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json).to match(hash_including(
        "id",
        "name",
        "description",
        "src",
        "width",
        "height"
      ))
    end

    it "creates a new collection given an image file" do
      stub_cloudinary
      post "/api/collections", params: {
        caption: "Test",
        image: "test.jpg",
        color: "#323"
      }
      json = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json).to match(hash_including(
        "id",
        "name",
        "description",
        "src",
        "width",
        "height"
      ))
    end

    it "fails if not an admin" do
      user = User.create!(username: "b", email: "b@email.com", password: "password")
      stub_current_user(user)
      post "/api/collections"
      expect(response).to have_http_status(401)
    end

    it "fails with invalid parameters" do
      post "/api/collections"
      expect(response).to have_http_status(422)
    end
  end
end

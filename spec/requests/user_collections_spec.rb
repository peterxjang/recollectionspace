require 'rails_helper'

RSpec.describe "UserCollections", type: :request do
  before :each do
    Collection.create!(name: "music")
    Collection.create!(name: "movies")
    Collection.create!(name: "books")
    user = User.create!(username: "a", email: "a@email.com", password: "password")
    stub_current_user(user)

    Collection.create!(name: "things")
    record = Record.create!(collection_id: Collection.first.id, name: "Test record")
    UserRecord.create!(record_id: record.id, name: "Test record", user_collection_id: user.user_collections.first.id)
  end

  describe "GET /api/user_collections" do
    it "should return an array of user collections" do
      get "/api/user_collections"
      json = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json).to match(hash_including(
        "clientUrl",
        "isOwner",
        "selectedItem",
        "canvas",
        "items"
      ))
      expect(json["canvas"]).to match(hash_including(
        "id",
        "x",
        "y",
        "angle",
        "scale",
        "color",
        "src",
        "type" => "follow"
      ))
      expect(json["items"][0]).to match(hash_including(
        "id",
        "created",
        "caption",
        "body",
        "x",
        "y",
        "src",
        "width",
        "height",
        "color",
        "angle",
        "scale",
        "border",
        "type" => "collection"
      ))
    end
  end

  describe "POST /api/user_collections" do
    it "should create a new user collection given a valid collection id" do
      collection = Collection.last
      post "/api/user_collections", params: {
        collection_id: collection.id
      }
      json = JSON.parse(response.body)
      expect(response).to have_http_status(:created)
      expect(json).to match(hash_including(
        "id",
        "created",
        "name",
        "description",
        "collection_id",
        "x",
        "y",
        "width",
        "height",
        "angle",
        "scale",
        "border",
        "src",
        "color",
        "zindex",
        "type",
      ))
    end

    it "should create a new user collection with collection given caption and image" do
      user = User.create!(username: "admin", email: "admin@email.com", password: "password", admin: true)
      stub_current_user(user)
      stub_cloudinary
      post "/api/user_collections", params: {
        caption: "test caption",
        image: "test image"
      }
      json = JSON.parse(response.body)
      expect(response).to have_http_status(:created)
    end

    it "should fail if no collection id and no image/caption" do
      post "/api/user_collections"
      expect(response).to have_http_status(422)
    end

    it "should fail if no collection id and user is not admin" do
      post "/api/user_collections", params: {
        caption: "Test caption",
        image: "test image"
      }
      expect(response).to have_http_status(422)
    end

    it "should fail if no collection id and invalid caption" do
      user = User.create!(username: "admin", email: "admin@email.com", password: "password", admin: true)
      stub_current_user(user)
      stub_cloudinary
      post "/api/user_collections", params: {
        caption: nil,
        image: "test image"
      }
      json = JSON.parse(response.body)
      expect(response).to have_http_status(422)
    end
  end

  describe "GET /api/user_collections/:id" do
    it "should show a user collection by id" do
      user_collection = User.first.user_collections.first
      get "/api/user_collections/#{user_collection.id}"
      json = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json).to match(hash_including(
        "clientUrl",
        "isOwner",
        "selectedItem",
        "canvas",
        "items"
      ))
      expect(json["canvas"]).to match(hash_including(
        "id",
        "x",
        "y",
        "angle",
        "scale",
        "color",
        "src",
        "type" => "collection"
      ))
      expect(json["items"][0]).to match(hash_including(
        "id",
        "created",
        "caption",
        "body",
        "x",
        "y",
        "src",
        "width",
        "height",
        "color",
        "angle",
        "scale",
        "border",
        "type" => "record"
      ))
    end

    it "should show a user collection by username & collection name" do
      user = User.first
      get "/api/user_collections/search?username=#{user.username}&collection_name=music"
      json = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json).to match(hash_including(
        "clientUrl",
        "isOwner",
        "selectedItem",
        "canvas",
        "items"
      ))
      expect(json["canvas"]).to match(hash_including(
        "id",
        "x",
        "y",
        "angle",
        "scale",
        "color",
        "src",
        "type" => "collection"
      ))
      expect(json["items"][0]).to match(hash_including(
        "id",
        "created",
        "caption",
        "body",
        "x",
        "y",
        "src",
        "width",
        "height",
        "color",
        "angle",
        "scale",
        "border",
        "type" => "record"
      ))
    end

    it "should fail with an invalid id" do
      get "/api/user_collections/0"
      expect(response).to have_http_status(:bad_request)
    end

    it "should fail with invalid search options" do
      get "/api/user_collections/search?username=a&collection_name=nothing"
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "PATCH /api/user_collections/:id" do
    it "should update a user collection" do
      user = User.first
      patch "/api/user_collections/#{user.user_collections.first.id}?user_id:#{user.id}", params: {
        x: 1,
        y: 2
      }
      json = JSON.parse(response.body)
      expect(response).to have_http_status(:ok)
      expect(json).to match(hash_including(
        "id" => anything,
        "created" => anything,
        "name" => anything,
        "description" => anything,
        "collection_id" => anything,
        "x" => 1,
        "y" => 2,
        "width" => anything,
        "height" => anything,
        "angle" => anything,
        "scale" => anything,
        "border" => anything,
        "src" => anything,
        "color" => anything,
        "zindex" => anything,
        "type" => "collection"
      ))
    end

    it "should fail with an invalid params" do
      get "/api/user_collections/0"
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "DELETE /api/user_collections/:id" do
    it "should destroy a user collection" do
      user = User.first
      delete "/api/user_collections/#{user.user_collections.first.id}?user_id:#{user.id}"
      expect(response).to have_http_status(:ok)
    end

    it "should fail with an invalid params" do
      delete "/api/user_collections/0"
      expect(response).to have_http_status(:bad_request)
    end
  end
end

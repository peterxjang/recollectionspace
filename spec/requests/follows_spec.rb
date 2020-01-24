require 'rails_helper'

RSpec.describe "Follows", type: :request do
  before :each do
    Collection.create!(name: "music")
    Collection.create!(name: "movies")
    Collection.create!(name: "books")
    names = ["a", "b", "c", "d", "e", "f", "g"]
    names.each do |name|
      User.create!(username: name, email: "#{name}@email.com", password: "password")
    end
    user = User.first
    stub_current_user(user)
  end

  describe "get /api/follows" do
    it "gets the follows for the current user" do
      get "/api/follows"
      follows = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(follows).to match(hash_including(
        "clientUrl",
        "isOwner",
        "selectedItem",
        "canvas",
        "items"
      ))
      expect(follows["canvas"]).to match(hash_including(
        "id",
        "x",
        "y",
        "angle",
        "scale",
        "color",
        "src",
        "type" => "root"
      ))
      expect(follows["items"][0]).to match(hash_including(
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
        "type" => "follow"
      ))
    end
  end

  describe "post /api/follows" do
    it "creates a new follow" do
      post "/api/follows", params: {
        following_id: User.second.id,
      }
      follow = JSON.parse(response.body)
      expect(response).to have_http_status(:created)
      expect(follow).to match(hash_including(
        "id",
        "created",
        "name",
        "description",
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
        "type" => "follow"
      ))
    end

    it "returns errors for incorrect data" do
      post "/api/follows"
      json = JSON.parse(response.body)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json).to match(hash_including(
        "errors"
      ))
    end
  end

  describe "get /api/follows/:id" do
    it "gets data for one follow" do
      follow_id = Follow.first.id
      get "/api/follows/#{follow_id}"
      follow = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(follow).to match(hash_including(
        "clientUrl",
        "isOwner",
        "selectedItem",
        "canvas",
        "items"
      ))
      expect(follow["canvas"]).to match(hash_including(
        "id",
        "x",
        "y",
        "angle",
        "scale",
        "color",
        "src",
        "type" => "follow"
      ))
      expect(follow["items"][0]).to match(hash_including(
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

  describe "patch /api/follows/:id" do
    it "should update the geometry" do
      follow_id = Follow.first.id
      patch "/api/follows/#{follow_id}", params: {
        x: 1,
        y: 2
      }
      follow = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(follow).to match(hash_including(
        "id" => anything,
        "created" => anything,
        "name" => anything,
        "description" => anything,
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
        "type" => "follow"
      ))
    end
  end

  describe "delete /api/follows/:id" do
    it "should delete a follow" do
      follow = Follow.create!(follower_id: User.first.id, following_id: User.last.id)
      delete "/api/follows/#{follow.id}"
      expect(response).to have_http_status(200)
      expect(Follow.find_by(id: follow.id)).to eq(nil)
    end

    it "should not delete a self follow" do
      follow_id = Follow.first.id
      delete "/api/follows/#{follow_id}"
      expect(response).to have_http_status(422)
    end
  end
end

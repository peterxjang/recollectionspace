require 'rails_helper'

RSpec.describe "Users", type: :request do
  before :each do
    Collection.create!(name: "music")
    Collection.create!(name: "movies")
    Collection.create!(name: "books")
    names = ["a", "b", "c", "d", "e", "f", "g"]
    names.each do |name|
      User.create!(username: name, email: "#{name}@email.com", password: "password")
    end
  end

  describe "GET /api/users" do
    it "gets an array of up to 5 users" do
      get "/api/users"
      users = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(users.length).to eq(5)
      expect(users[0]).to match(hash_including(
        "id",
        "username",
        "avatar",
        "src",
        "width",
        "height",
        "collections"
      ))
    end
  end

  # describe "POST /api/users" do
  #   it "creates a user with associated collections" do
  #     post "/api/users", params: {
  #       username: "bob",
  #       email: "bob@email.com",
  #       password: "password"
  #     }
  #     expect(response).to have_http_status(201)
  #     expect(User.last.user_collections.length).to eq(3)
  #   end
  # end

  describe "SHOW /api/users" do
    it "should get a user by username" do
      user = User.second
      get "/api/users/#{user.username}"
      json = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json).to match(hash_including(
        "clientUrl" => "/#{user.username}",
        "isOwner" => anything,
        "selectedItem" => anything,
        "canvas" => anything,
        "items" => anything
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

    it "should return an error for an unknown username" do
      get "/api/users/bad_name"
      expect(response).to have_http_status(:bad_request)
    end
  end
end

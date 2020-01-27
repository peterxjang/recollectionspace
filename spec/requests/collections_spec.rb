require 'rails_helper'

RSpec.describe "Collections", type: :request do
  before :each do
    Collection.create!(name: "music")
    Collection.create!(name: "movies")
    Collection.create!(name: "books")
    Collection.create!(name: "a")
    Collection.create!(name: "b")
    Collection.create!(name: "c")
    Collection.create!(name: "d")
    Collection.create!(name: "e")
    Collection.create!(name: "f")
    Collection.create!(name: "g")
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

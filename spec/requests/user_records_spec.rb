require 'rails_helper'

RSpec.describe "UserRecords", type: :request do
  before :each do
    Collection.create!(name: "music")
    Collection.create!(name: "movies")
    Collection.create!(name: "books")
    user = User.create!(username: "a", email: "a@email.com", password: "password")
    stub_current_user(user)
  end

  describe "POST /api/user_records" do
    it "creates a user record and a record given user collection id and an image" do
      stub_cloudinary
      user_collection = UserCollection.last
      post "/api/user_records", params: {
        user_collection_id: user_collection.id,
        image: "https://example.com/test.jpg",
        name: "Test"
      }
      json = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json).to match(hash_including(
        "id",
        "created",
        "name",
        "description",
        "user_collection_id",
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

    it "creates a user record given a user collection id and a record api id" do
      user_collection = UserCollection.last
      Record.create!(collection_id: Collection.last.id, name: "Test record", api_id: "123")
      post "/api/user_records", params: {
        user_collection_id: user_collection.id,
        api_id: "123"
      }
      json = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json).to match(hash_including(
        "id",
        "created",
        "name",
        "description",
        "user_collection_id",
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

    it "fails with invalid user collection id" do
      post "/api/user_records", params: {
        user_collection_id: -1,
      }
      expect(response).to have_http_status(422)
    end

    it "fails if user record already exists" do
      user_collection = UserCollection.last
      record = Record.create!(collection_id: Collection.last.id, name: "Test record", api_id: "123")
      UserRecord.create!(record_id: record.id, name: "Test record", user_collection_id: user_collection.id)
      post "/api/user_records", params: {
        user_collection_id: user_collection.id,
        api_id: "123"
      }
      json = JSON.parse(response.body)
      expect(response).to have_http_status(422)
    end

    it "fails if no image provided" do
      user_collection = UserCollection.last
      post "/api/user_records", params: {
        user_collection_id: user_collection.id,
      }
      expect(response).to have_http_status(422)
    end
  end

  describe "PATCH /api/user_records/:id" do
    it "updates a user record" do
      user_collection = UserCollection.last
      record = Record.create!(collection_id: Collection.last.id, name: "Test record", api_id: "123")
      user_record = UserRecord.create!(record_id: record.id, name: "Test record", user_collection_id: user_collection.id)
      patch "/api/user_records/#{user_record.id}", params: {
        x: 1,
        y: 2
      }
      json = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json).to match(hash_including(
        "id" => anything,
        "created" => anything,
        "name" => anything,
        "description" => anything,
        "user_collection_id" => anything,
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
        "type" => "record"
      ))
    end

    it "fails with invalid user record id" do
      patch "/api/user_records/0", params: {
        x: 1,
        y: 2
      }
      expect(response).to have_http_status(422)
    end

    it "fails with user record from a different user's user collection" do
      User.create!(username: "b", email: "b@email.com", password: "password")
      user_collection = UserCollection.last
      record = Record.create!(collection_id: Collection.last.id, name: "Test record", api_id: "123")
      user_record = UserRecord.create!(record_id: record.id, name: "Test record", user_collection_id: user_collection.id)
      patch "/api/user_records/#{user_record.id}", params: {
        x: 1,
        y: 2
      }
      expect(response).to have_http_status(401)
    end
  end

  describe "DELETE /api/user_records/:id" do
    it "destroys a user record" do
      user_collection = UserCollection.last
      record = Record.create!(collection_id: Collection.last.id, name: "Test record", api_id: "123")
      user_record = UserRecord.create!(record_id: record.id, name: "Test record", user_collection_id: user_collection.id)
      delete "/api/user_records/#{user_record.id}"
      expect(response).to have_http_status(200)
      expect(Record.find_by(id: record.id)).to_not be_nil
    end

    it "destroys a user record and the record if it's the last non-api record" do
      user_collection = UserCollection.last
      record = Record.create!(collection_id: Collection.last.id, name: "Test record")
      user_record = UserRecord.create!(record_id: record.id, name: "Test record", user_collection_id: user_collection.id)
      delete "/api/user_records/#{user_record.id}"
      expect(response).to have_http_status(200)
      expect(Record.find_by(id: record.id)).to be_nil
    end

    it "destroys a user record and not the non-last record" do
      user_collection = UserCollection.last
      record = Record.create!(collection_id: Collection.last.id, name: "Test record")
      user_record = UserRecord.create!(record_id: record.id, name: "Test record", user_collection_id: user_collection.id)
      user_record = UserRecord.create!(record_id: record.id, name: "Test record", user_collection_id: user_collection.id)
      delete "/api/user_records/#{user_record.id}"
      expect(response).to have_http_status(200)
      expect(Record.find_by(id: record.id)).to_not be_nil
    end

    it "fails with invalid user record id" do
      delete "/api/user_records/0"
      expect(response).to have_http_status(422)
    end

    it "fails with user record from a different user's user collection" do
      User.create!(username: "b", email: "b@email.com", password: "password")
      user_collection = UserCollection.last
      record = Record.create!(collection_id: Collection.last.id, name: "Test record", api_id: "123")
      user_record = UserRecord.create!(record_id: record.id, name: "Test record", user_collection_id: user_collection.id)
      delete "/api/user_records/#{user_record.id}"
      expect(response).to have_http_status(401)
    end
  end
end

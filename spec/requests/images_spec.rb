require 'rails_helper'

RSpec.describe "Images", type: :request do
  describe "POST api/images" do
    it "should upload a file and return the url" do
      stub_cloudinary
      post "/api/images"
      json = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json["url"]).to start_with("http")
    end
  end
end

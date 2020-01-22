def stub_cloudinary
  allow(Cloudinary::Uploader).to receive(:upload) {{"secure_url" => "http://example.com/image.jpg"}}
end

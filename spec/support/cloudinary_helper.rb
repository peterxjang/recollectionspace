def stub_cloudinary
  allow(Cloudinary::Uploader).to receive(:upload) {{"secure_url" => "http://example.com/image.jpg", "width" => 640, "height" => 480}}
end

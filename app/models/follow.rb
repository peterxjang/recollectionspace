class Follow < ApplicationRecord
  belongs_to :follower, class_name: "User"
  belongs_to :following, class_name: "User"

  def type
    "follow"
  end

  def name
    following.username
  end

  def description
    ""
  end

  def body
    description
  end

  def client_url
    "/#{following.username}"
  end
end

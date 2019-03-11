Rails.application.routes.draw do
  get "/" => "pages#index"

  namespace :api do
    post "/users" => "users#create"
    post "/sessions" => "sessions#create"
  end
end

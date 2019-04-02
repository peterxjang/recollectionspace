Rails.application.routes.draw do
  get "/" => "pages#index"

  namespace :api do
    post "/users" => "users#create"
    post "/sessions" => "sessions#create"
    get "/collections" => "collections#index"
    get "/collections/:id" => "collections#show"
    post "/records" => "records#create"
    patch "/records/:id" => "records#update"
  end
end

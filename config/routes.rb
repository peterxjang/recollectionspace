Rails.application.routes.draw do
  get "/" => "pages#index"

  namespace :api do
    get "/users" => "users#index"
    post "/users" => "users#create"
    get "/users/:username" => "users#show"
    post "/sessions" => "sessions#create"
    get "/follows" => "follows#index"
    post "/follows" => "follows#create"
    get "/follows/:id" => "follows#show"
    patch "/follows/:id" => "follows#update"
    delete "/follows/:id" => "follows#destroy"
    get "/collection_categories" => "collection_categories#index"
    get "/collections" => "collections#index"
    post "/collections" => "collections#create"
    get "/collections/:id" => "collections#show"
    patch "/collections/:id" => "collections#update"
    delete "/collections/:id" => "collections#destroy"
    post "/records" => "records#create"
    patch "/records/:id" => "records#update"
    delete "/records/:id" => "records#destroy"
    get "/books" => "books#index"
    get "/movies" => "movies#index"
  end

  get "/*path" => "pages#index"
end

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
    get "/collections" => "collections#index"
    get "/user_collections" => "user_collections#index"
    post "/user_collections" => "user_collections#create"
    get "/user_collections/:id" => "user_collections#show"
    patch "/user_collections/:id" => "user_collections#update"
    delete "/user_collections/:id" => "user_collections#destroy"
    post "/user_records" => "user_records#create"
    patch "/user_records/:id" => "user_records#update"
    delete "/user_records/:id" => "user_records#destroy"
    get "/books" => "records#search_books"
    get "/movies" => "records#search_movies"
    get "/music" => "records#search_music"
  end

  get "/*path" => "pages#index"
end

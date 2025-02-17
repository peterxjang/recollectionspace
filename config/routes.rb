Rails.application.routes.draw do
  namespace :api do
    get "/users" => "users#index"
    # post "/users" => "users#create"
    get "/users/:username" => "users#show"
    post "/sessions" => "sessions#create"
    delete "/sessions" => "sessions#destroy"
    get "/follows" => "follows#index"
    post "/follows" => "follows#create"
    get "/follows/:id" => "follows#show"
    patch "/follows/:id" => "follows#update"
    delete "/follows/:id" => "follows#destroy"
    get "/collections" => "collections#index"
    post "/collections" => "collections#create"
    get "/user_collections" => "user_collections#index"
    post "/user_collections" => "user_collections#create"
    get "/user_collections/:id" => "user_collections#show"
    patch "/user_collections/:id" => "user_collections#update"
    delete "/user_collections/:id" => "user_collections#destroy"
    post "/user_records" => "user_records#create"
    patch "/user_records/:id" => "user_records#update"
    delete "/user_records/:id" => "user_records#destroy"
    post "/images" => "images#create"
    get "/books" => "records#search_books"
    get "/movies" => "records#search_movies"
    get "/music" => "records#search_music"
  end

  get "/" => "pages#home"
  get "/:username/:collection_name/new" => "user_records#new"
  get "/:username/:collection_name/:user_record_id/edit" => "user_records#edit"
  get "/*path" => "pages#main"
  post "/sessions" => "sessions#create"

  get "up" => "rails/health#show", as: :rails_health_check
end

Rails.application.routes.draw do
  get "/" => "pages#index"

  namespace :api do
    get "/users" => "users#index"
    post "/users" => "users#create"
    post "/sessions" => "sessions#create"
    get "/follows" => "follows#index"
    post "/follows" => "follows#create"
    get "/follows/:id" => "follows#show"
    delete "/follows/:id" => "follows#destroy"
    get "/collections" => "collections#index"
    get "/collections/:id" => "collections#show"
    post "/records" => "records#create"
    patch "/records/:id" => "records#update"
    delete "/records/:id" => "records#destroy"
  end
end

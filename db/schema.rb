# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_01_04_195002) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "collections", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "src"
    t.integer "width"
    t.integer "height"
    t.string "color"
    t.boolean "public", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "follows", force: :cascade do |t|
    t.integer "follower_id"
    t.integer "following_id"
    t.float "x", default: 0.0
    t.float "y", default: 0.0
    t.integer "width"
    t.integer "height"
    t.float "angle", default: 0.0
    t.float "scale", default: 1.0
    t.boolean "border", default: true
    t.string "src"
    t.string "color"
    t.integer "zindex", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "records", force: :cascade do |t|
    t.string "api_id"
    t.integer "collection_id"
    t.string "name"
    t.text "description"
    t.integer "width"
    t.integer "height"
    t.string "src"
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_collections", force: :cascade do |t|
    t.integer "user_id"
    t.integer "collection_id"
    t.float "x", default: 0.0
    t.float "y", default: 0.0
    t.integer "width"
    t.integer "height"
    t.float "angle", default: 0.0
    t.float "scale", default: 1.0
    t.boolean "border", default: true
    t.string "src"
    t.string "color"
    t.integer "zindex", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_records", force: :cascade do |t|
    t.integer "record_id"
    t.string "name"
    t.text "description"
    t.integer "user_collection_id"
    t.float "x", default: 0.0
    t.float "y", default: 0.0
    t.integer "width"
    t.integer "height"
    t.float "angle", default: 0.0
    t.float "scale", default: 1.0
    t.boolean "border", default: true
    t.string "src"
    t.string "color"
    t.integer "zindex", default: 0
    t.text "rendered_description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "email"
    t.string "password_digest"
    t.boolean "admin", default: false
    t.string "first_name"
    t.string "last_name"
    t.string "avatar"
    t.float "x", default: 0.0
    t.float "y", default: 0.0
    t.integer "width"
    t.integer "height"
    t.float "angle", default: 0.0
    t.float "scale", default: 1.0
    t.boolean "border", default: true
    t.string "src"
    t.string "color"
    t.integer "zindex", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
end

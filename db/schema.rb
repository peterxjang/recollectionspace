# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_03_06_171121) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "collection_categories", force: :cascade do |t|
    t.integer "user_id"
    t.string "name"
    t.text "description"
    t.boolean "public", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "collections", force: :cascade do |t|
    t.integer "user_id"
    t.integer "collection_category_id"
    t.float "x"
    t.float "y"
    t.integer "width"
    t.integer "height"
    t.float "angle", default: 0.0
    t.float "scale"
    t.boolean "border", default: true
    t.string "src"
    t.string "color"
    t.integer "zindex", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "follows", force: :cascade do |t|
    t.integer "follower_id"
    t.integer "following_id"
    t.float "x"
    t.float "y"
    t.integer "width"
    t.integer "height"
    t.float "angle", default: 0.0
    t.float "scale"
    t.boolean "border", default: true
    t.string "src"
    t.string "color"
    t.integer "zindex", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "records", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.integer "collection_id"
    t.float "x"
    t.float "y"
    t.integer "width"
    t.integer "height"
    t.float "angle", default: 0.0
    t.float "scale"
    t.boolean "border", default: true
    t.string "src"
    t.string "color"
    t.integer "zindex", default: 0
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
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end

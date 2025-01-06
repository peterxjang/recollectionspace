class CreateUserRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :user_records do |t|
      t.integer :record_id
      t.string :name
      t.text :description
      t.integer :user_collection_id
      t.float :x, default: 0
      t.float :y, default: 0
      t.integer :width
      t.integer :height
      t.float :angle, default: 0
      t.float :scale, default: 1
      t.boolean :border, default: true
      t.string :src
      t.string :color
      t.integer :zindex, default: 0
      t.text :rendered_description

      t.timestamps
    end
  end
end

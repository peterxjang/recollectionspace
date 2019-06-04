class CreateRecords < ActiveRecord::Migration[5.2]
  def change
    create_table :records do |t|
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

      t.timestamps
    end
  end
end

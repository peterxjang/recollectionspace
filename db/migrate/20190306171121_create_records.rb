class CreateRecords < ActiveRecord::Migration[5.2]
  def change
    create_table :records do |t|
      t.string :name
      t.text :description
      t.integer :collection_id
      t.float :x
      t.float :y
      t.integer :width
      t.integer :height
      t.float :angle, default: 0
      t.float :scale
      t.boolean :border, default: true
      t.string :src
      t.string :color
      t.integer :zindex, default: 0

      t.timestamps
    end
  end
end

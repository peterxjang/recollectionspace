class CreateRecords < ActiveRecord::Migration[5.2]
  def change
    create_table :records do |t|
      t.string :api_id
      t.integer :collection_id
      t.string :name
      t.text :description
      t.integer :width
      t.integer :height
      t.string :src
      t.string :color

      t.timestamps
    end
  end
end

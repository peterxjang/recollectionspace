class CreateCollections < ActiveRecord::Migration[8.0]
  def change
    create_table :collections do |t|
      t.string :name
      t.text :description
      t.string :src
      t.integer :width
      t.integer :height
      t.string :color
      t.boolean :public, default: true

      t.timestamps
    end
  end
end

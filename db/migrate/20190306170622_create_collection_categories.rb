class CreateCollectionCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :collection_categories do |t|
      t.integer :user_id
      t.string :name
      t.text :description
      t.boolean :public, default: false

      t.timestamps
    end
  end
end

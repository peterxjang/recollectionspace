class CreateUsers < ActiveRecord::Migration[5.2]
  def change
    create_table :users do |t|
      t.string :username
      t.string :email
      t.string :password_digest
      t.boolean :admin, default: false
      t.string :first_name
      t.string :last_name
      t.string :avatar
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

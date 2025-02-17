class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :username
      t.string :email
      t.string :password_digest
      t.boolean :admin, default: false
      t.string :first_name
      t.string :last_name
      t.string :avatar
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

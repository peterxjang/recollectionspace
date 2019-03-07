class CreateFollows < ActiveRecord::Migration[5.2]
  def change
    create_table :follows do |t|
      t.integer :follower_id
      t.integer :following_id
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

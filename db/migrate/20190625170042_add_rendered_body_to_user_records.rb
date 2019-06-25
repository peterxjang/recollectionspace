class AddRenderedBodyToUserRecords < ActiveRecord::Migration[5.2]
  def change
    add_column :user_records, :rendered_description, :text
  end
end

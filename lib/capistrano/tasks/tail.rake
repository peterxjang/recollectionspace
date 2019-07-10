namespace :logs do
  desc "tail rails logs. Usage cap production logs:tail_rails"
  task :tail_rails do
    on roles(:app) do
      execute "tail -f #{shared_path}/log/#{fetch(:rails_env)}.log"
    end
  end
end


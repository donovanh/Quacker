source :rubygems
ruby '1.9.2'
gem 'rake'
gem 'sinatra', '~> 1.2.3'
gem 'haml', '~> 3.1.4'
gem 'microsoft_translator', '~> 0.1.1'
gem 'json'
gem 'omniauth'
gem 'omniauth-twitter'
gem 'twitter'
gem 'dm-core'
gem 'dm-migrations'

group :development, :test do
  gem 'sqlite3'
  gem 'dm-sqlite-adapter'
  gem 'shotgun', '~> 0.9'
  
  # Sass & Compass
  gem 'sass'
  gem 'compass'

  # Sass libraries
  gem 'grid-coordinates', '~> 1.1.4'
  gem 'sassy-buttons'
  
end
group :production do
  gem 'pg'
  gem 'dm-postgres-adapter'
end
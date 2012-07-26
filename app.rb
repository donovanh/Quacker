require 'rubygems'
require 'sinatra'
require 'haml'
require 'json'
require 'microsoft_translator'
require 'omniauth'
require 'omniauth-twitter'
require 'twitter'
require 'dm-core'
require 'dm-migrations'

# Helpers
require './lib/render_partial'

# Set Sinatra variables
set :app_file, __FILE__
set :root, File.dirname(__FILE__)
set :views, 'views'
set :public_folder, 'public'
set :haml, {:format => :html5} # default Haml format is :xhtml


DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite3://#{Dir.pwd}/database.db")

require './settings'

# Twitter app details
myTwitterAppDetails = {
  :app_id =>      ENV['TWITTER_ID'] || settings.twitter_id,
  :app_secret =>  ENV['TWITTER_SECRET'] || settings.twitter_secret
}

# Microsoft Translate details
myMicrosoftTranslateAppDetails = {
  :app_id =>      ENV['MICROSOFT_ID'] || settings.microsoft_translate_id,
  :app_secret =>  ENV['MICROSOFT_SECRET'] || settings.microsoft_translate_secret
}

class User
  include DataMapper::Resource
  property :id,               Serial
  property :uid,              String
  property :oAuthToken,       String
  property :oAuthTokenSecret, String
  property :name,             String
  property :nickname,         String
  property :created_at,       DateTime
end

DataMapper.finalize
DataMapper.auto_upgrade!

use OmniAuth::Strategies::Twitter, myTwitterAppDetails[:app_id], myTwitterAppDetails[:app_secret]

enable :sessions

helpers do
  def current_user
    @current_user ||= User.get(session[:user_id]) if session[:user_id]
  end
end

# Application routes
get '/' do
  current_user
  haml :index, :layout => :'layouts/application'
end

post '/translate' do
  # Send the text through Microsoft Translate
  translator = MicrosoftTranslator::Client.new(myMicrosoftTranslateAppDetails[:app_id], myMicrosoftTranslateAppDetails[:app_secret])
  outputText = translator.translate(
    params[:mytext],
    params[:from],
    params[:to],
  "text/html")
  # outputText = 'argle bargle doodly doo'
  # Return as JSON object
  content_type :json
  {
    :translated => outputText,
    :mytext => params[:mytext],
    :from => params[:from],
    :to => params[:to]
  }.to_json
 
end

# Send out a tweet to the user's account
post '/tweet' do
  # The following commented out to debug
  message_to_tweet = params["translatedText"]
    # Twitter.configure do |config|
    #   config.consumer_key = myTwitterAppDetails[:app_id]
    #   config.consumer_secret = myTwitterAppDetails[:app_secret]
    #   config.oauth_token = current_user[:oAuthToken]
    #   config.oauth_token_secret = current_user[:oAuthTokenSecret]
    # end
    # twittered = Twitter.update(message_to_tweet)
    
  # TODO: Handle errors: Twitter::Error::Forbidden: Status is a duplicate.
  #current_user
  # Return as JSON object
  content_type :json
  {
    :message_to_tweet => message_to_tweet,
    :done => "yes"
  }.to_json
end

# Signup / signout  

get '/auth/:name/callback' do
  auth = request.env["omniauth.auth"]
  user = User.first_or_create({ :uid => auth["uid"]}, {
    :uid => auth["uid"],
    :nickname => auth["info"]["nickname"], 
    :name => auth["info"]["name"],
    :oAuthToken => auth['credentials']['token'], 
    :oAuthTokenSecret => auth['credentials']['secret'],
    :created_at => Time.now })
  session[:user_id] = user.id
  redirect '/'
end

# any of the following routes should work to sign the user in: 
#   /sign_up, /signup, /sign_in, /signin, /log_in, /login
["/sign_in/?", "/signin/?", "/log_in/?", "/login/?", "/sign_up/?", "/signup/?"].each do |path|
  get path do
    redirect '/auth/twitter'
  end
end

# either /log_out, /logout, /sign_out, or /signout will end the session and log the user out
["/sign_out/?", "/signout/?", "/log_out/?", "/logout/?"].each do |path|
  get path do
    session[:user_id] = nil
    redirect '/'
  end
end

# Dev test page
get '/duck' do
  haml :duck, :layout => :'layouts/application'
end

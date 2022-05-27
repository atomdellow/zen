# zen
#A collection of Apps made by Adam Dellow, using Node.js, and other Web Techknowledgies
#The server is made with Node.js, it's entry point is app.js
#please use the JSON file for the dependencies, you would use Hyper(bash) using:
npm i {package name} @{version} --save #which also adds them to your own JSON listing the dependencies
#this will allow you to still have the same versions that I'm using, without a massive install file
#It was also necessary for me to exclude the node_modules for heroku, as they already have the versions I need

#in the project will be many different projects, from login platform, blog, syntax reference, task manager
#some python scripts, databases, templates for websites, bootstrap/jquery templates
#https://www.zen-app.ca will be the website I'll be using for this
#it's hosted on Heroku

/*The Environment Variables file and Node-Modules folder are not present. In it's current state, if you ran the server of app.js, it will throw errors the moment you #connect. To fix these, you'll need to make your own Environment Variable. */

#Using Hyper (a bash terminal emulator) found here: https://hyper.is/ , you can create this. 
#The following commands would be:

cd {file path of folder containing 'zen'}
touch .env

#The Variable names you'll need to supplement are:
DB_CONNECT=
PORT=
CLIENT_ID=
CLIENT_SECRET=
weatherAPI=
nasaAPI=

#you'll want to open your own account in Atlas, a featured product from Mongo for remote Database storage found here https://www.mongodb.com/atlas/database
#set in the port number you wish to use
#you'll need to get your own Google OAuth keys: https://developers.google.com/identity/protocols/oauth2
#You can sign up for OpenWeathermap and get an api key here: https://openweathermap.org/api
#this is the link for the Nasa API's https://api.nasa.gov/ , from there you can use the APOD(astronomy Pic of the day) API

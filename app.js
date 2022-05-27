//jshint esversion:6

//////////////////////////////
//Declaring Required Packages
////////////////////////////
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const connectDB = process.env.DB_CONNECT;
const port = process.env.PORT;
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const https = require('https');
const parseString = require('xml2js').parseString;

//////////////////////////////
//Setting View Engine
////////////////////////////

app.set('view engine', 'ejs');

var xml = "<root>Hello xml2js!</root>"
parseString(xml, function (err, result) {
    console.log(JSON.stringify(result));
});
//////////////////////////////
//Declaring Variables
////////////////////////////
var getDate = new Date();
var yyyy = getDate.getFullYear();
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

///////////////////////////////////////////
//Creating conditions for files and paths
////////////////////////////////////////
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static('files'))
var path = require("path");
//app.use(express.static(__dirname + '/view'));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

//////////////////////////////
//Initializes Passport
////////////////////////////
//saves sessions and cookies

app.use(passport.initialize());
app.use(passport.session());
const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//////////////////////////////
//Connect to Mongo Database
////////////////////////////

mongoose.connect(process.env.DB, {useNewUrlParser: true});
const postSchema = {
  title: String,
  content: String
};
const User = new mongoose.model("User", userSchema);

//////////////////////////////
//User Lookup and validate
////////////////////////////

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
///////////////
//O-Auth Usage
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

const Post = mongoose.model("Post", postSchema);

//Checks if Logged in

function checkLogin(req, res, next) {
    if (req.session.user_id) {
        db.collection('users', function (err, collection) {
            if (err) return next(err); // handle errors!
            collection.findOne({
                _id: new ObjectID(req.session.user_id)
            }, function (err, user) {
                if (user) {
                    req.currentUser = user;
                    console.log("verified user");
                } else {
                    req.currentUser = null;
                    console.log("Could not verify the user");
                }
                next();
            });
        });
    } else {
        req.currentUser = null;
        next();
    }
}

//////////////////////////////
//Setting Up Routes
////////////////////////////
// Home Route
app.get("/", checkLogin, function(req, res){
    if (req.currentUser) {
      res.render("home.ejs", {
        login: 'PROFILE',
        loginhref: "profile",
        yyyy: getDate.getFullYear()
      });

  } else {
      res.render("home.ejs", {
      login: 'LOGIN',
      loginhref: "login",
      yyyy: getDate.getFullYear()
      })
    }
  });

var loggedIn = false;
var loginLink;
////////////////////////////////////////
//Google Auth Route
//Authorize Google Sign in with O Auth
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
  );

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
    });

////////////////////
//Register Route
////////////////
    app.get("/register", function(req, res){
      res.render("register", {
        yyyy: getDate.getFullYear(),
            loginhref: "login",
            login: "LOGIN",
            loginhref: "profile"});
    });


    app.get("/submit", function(req, res){
      if (req.isAuthenticated()){
        res.render("submit", {
          yyyy: getDate.getFullYear(),
          login: "PROFILE",
          loginhref: "profile"
        });
      } else {
        res.redirect("/login", {
          yyyy: getDate.getFullYear(),
          login: "LOGIN",
          loginhref: "login"
        });
      }
    });
    /////////////////////////////////////
    //Experimental Pyscript, not public
    //////////////////////////////////
    app.get("/pyscript", function(req, res){
      res.render("pyscript", {
        yyyy: getDate.getFullYear(),
            loginhref: "login",
            login: "PROFILE"});
    });

//submit secrets post, uses secrets route
    app.post("/submit", function(req, res){
      const submittedSecret = req.body.secret;

    //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
      // console.log(req.user.id);

      User.findById(req.user.id, function(err, foundUser){
        if (err) {
          console.log(err);
        } else {
          if (foundUser) {

            foundUser.secret = submittedSecret;
            foundUser.save(function(){
              res.redirect("/secrets");
            });
          }
        }
      });
    });
/////////////////////////
//Route for logging out
///////////////////////
    app.get("/logout", function(req, res){
      req.logout();
      res.redirect("/");
    });
    app.get("/secrets", checkLogin, function(req, res){
      User.find({"secret": {$ne: null}}, function(err, foundUsers){
        if (err){
          console.log(err);
        } else {
          if (foundUsers) {
            res.render("secrets.ejs", {
              yyyy: getDate.getFullYear(),
              usersWithSecrets: foundUsers,
              login: 'PROFILE',
              loginhref: "profile"
            });
          }else {
              res.render("login.ejs", {
                yyyy: getDate.getFullYear(),
                login: 'LOGIN',
                loginhref: "login"
              });
            }
        }
      });
    });
    //////////////////////////////////
    //posting route for Registering
    app.post("/register", function(req, res){

      User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
          });
        }
      });

    });
/////////////////////////
//post route for Login
    app.post("/login", function(req, res){

      const user = new User({
        username: req.body.username,
        password: req.body.password
      });

      req.login(user, function(err){
        if (err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
          });
        }
      });

    });
/////////////////
//Login Route
//////////////
app.get("/login", function(req, res){
    res.render("login", {
      yyyy: getDate.getFullYear(),
          loginhref: "login",
          login: "LOGIN"});
  });
  /////////////////
  //Profile Route
  //////////////
app.get("/profile", function(req, res){
    res.render("profile", {
      yyyy: getDate.getFullYear(),
          loginhref: "profile",
          login: "PROFILE"});
  });
  /////////////////
  //Blog Route
  //////////////
app.get("/blog", function(req, res){

  Post.find({}, function(err, posts){
    res.render("blog", {
      startingContent: homeStartingContent,
      posts: posts,
      loginhref: "profile",
      login: "PROFILE",
      yyyy: getDate.getFullYear()
      });
  });
});

/////////////////
//Syntax Schema
//////////////
const syntaxSchema = {
  title: String,
  content: String,
  author: String,
  dateCreated: Date,
  lastUpdated: Date,
  tags: Object,
  reactions: Object,
  draft: Object,
  previousSaves: Object,
  heroImage: String,
  multiMedia: Object,
  embeddedHTML: Object,
  comments: Object,
  category: Object,
  featured: String
};
const Syntax = mongoose.model("Syntax", syntaxSchema);

/////////////////
//Language
//////////////
app.get("/language", function(req, res){

  Syntax.find({}, function(err, syntaxes){
    res.render("language", {
      startingContent: homeStartingContent,
      syntaxes: syntaxes,
      login: "PROFILE",
      loginhref: "profile",
      yyyy: getDate.getFullYear()
      });
  });
});
/////////////////
//Apps
//////////////
app.get("/apps", function(req, res){
    res.render("apps", {
      yyyy: getDate.getFullYear(),
      loginhref: "login",
      login: "PROFILE"
    });
  });
  /////////////////
  //Templates
  //////////////
app.get("/templates", function(req, res){
    res.render("templates",{
      yyyy: getDate.getFullYear(),
          loginhref: "login",
          login: "PROFILE"});
  });
  /////////////////
  //About
  //////////////
app.get("/about", function(req, res){
  res.render("about", {
    yyyy: getDate.getFullYear(),
    loginhref: "login",
    login: "PROFILE",
    aboutContent: aboutContent});
});
/////////////////
//Contact
//////////////
app.get("/contact", function(req, res){
  res.render("contact", {
    yyyy: getDate.getFullYear(),
    contactContent: contactContent,
    loginhref: "login",
    login: "PROFILE"});
});
////////////////////////
//Composing Post route
/////////////////////
// this was for the wiki project
// currently not used**
// will likely remove
app.get("/compose", function(req, res){
  res.render("compose", {
    login: "PROFILE",
    loginhref: "profile",
    yyyy: getDate.getFullYear()
  });
});

////////////////////////////////////////
// API site examples
/////////////////////////////////////
// WEATHER API

app.get('/weather', function(req, res){
  const url = process.env.weatherAPI;
  https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      const weatherData = JSON.parse(data);
      const temp = weatherData.main.temp;
      const weather = weatherData.weather[0];
      const main = weather.main;
      const mainDescription = weather.description;
      console.log("Temperature is: " + temp);
      console.log("Weather will be mainly " + main + ", which is described as being, " + mainDescription);
      //console.log(JSON.stringify(weatherData));
    });
  });
  res.send("Weather API is cooking. ")
});
//NASA IMAGES
app.get('/nasa', function(req, res){
  const url = process.env.nasaAPI;
   https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      const nasaData = JSON.parse(data);
      const title = nasaData.title;
      const imgUrl = nasaData.url;
      console.log("The Title is " + "'" + title + "'" + " and the URL is: " + url);
      //console.log(JSON.stringify(weatherData));
      //console.log(xml);
    });
  });
  res.send("NASA API is cooking. ")
  });
//Dictionary api
app.get('/dictionary', function(req, res){
  let url = "https://api.dictionaryapi.dev/api/v2/entries/en/change";
  const word = "change";
  https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      const dictionaryData = JSON.parse(data);
      //const title = dictionaryData.title;
      const meaning = dictionaryData[0].meanings[0];
      console.log(meaning);
      //console.log(JSON.stringify(weatherData));
    });
  });
  res.send("Dictionary API is cooking. ")
  });

  //Stats Canada Data
  app.get('/statscan', function(req, res){
    res.sendFile((path.join(__dirname + '/public/xml/cubeMetadata.xsd')));
    const url = "https://www150.statcan.gc.ca/t1/wds/rest/getAllCubesList";
     https.get(url, function(response){
      console.log(response.statusCode);
      response.on("data", function(data){
        const statcanData = JSON.parse(data);

        console.log(JSON.stringify(statcanData));
        //console.log(xml);
      });
    });
    res.send("Stats Canada API is cooking. ")
    });

//////////////////////////////////////
//Composing Article, Posting - route
////////////////////////////////////
// this was for the wiki project
// currently not used**
// will likely remove
app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    author: req.body.postAuthor,
    dateCreated: req.body.postDateCreated,
    lastUpdated: req.body.postLastUpdated,
    tags: req.body.postTags,
    reactions: req.body.postReactions,
    draft: req.body.postDraft,
    previousSaves: req.body.postPreviousSaves,
    heroImage: req.body.postHeroImage,
    multiMedia: req.body.postMultiMedia,
    embeddedHTML: req.body.postEmbeddedHTML,
    comments: req.body.postComments,
    category: req.body.postCategory,
    featured: req.body.postFeatured
  })
  post.save(function(err){
    res.redirect("/");
  });
});

///////////////////////////
//Composing Syntax route
////////////////////////
app.get("/compose_syntax", function(req, res){
  res.render("compose_syntax", {
    login: "PROFILE",
    loginhref: "profile",
    yyyy: getDate.getFullYear()
  });
});
///////////////////////////
//Composing Syntax, posting-route
////////////////////////
app.post("/compose_syntax", function(req, res){
  const syntax = new Syntax({
    title: req.body.postTitle,
    content: req.body.postBody,
  });
  post.save(function(err){
    res.redirect("/syntax");
  });
});

////////////////////////
//Composing Post route
/////////////////////
app.get("/compose_post", function(req, res){
  res.render("compose_post",
  {
        loginhref: "login",
        login: "LOGIN",
        loginhref: "profile",
        yyyy: getDate.getFullYear()
      });
});
/////////////////////////////
//Composing Post, post-route
///////////////////////////
app.post("/compose_post", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    author: req.body.postAuthor,
    dateCreated: req.body.postDateCreated,
    lastUpdated: req.body.postLastUpdated,
    tags: req.body.postTags,
    reactions: req.body.postReactions,
    draft: req.body.postDraft,
    previousSaves: req.body.postPreviousSaves,
    heroImage: req.body.postHeroImage,
    multiMedia: req.body.postMultiMedia,
    embeddedHTML: req.body.postEmbeddedHTML,
    comments: req.body.postComments,
    category: req.body.postCategory,
    featured: req.body.postFeatured
  });
  post.save(function(err){
    res.redirect("/blog");
  });
});

////////////////////////
//Dynamic Routes
/////////////////////
// app.use gets the static images with a different route
app.use("/posts/:postId", express.static('/public'));
// dynamic posts, based on Post Id retrieved from database
app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;
  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      yyyy: getDate.getFullYear(),
      title: post.title,
      content: post.content,
      author: post.author,
      dateCreated: post.postDateCreated,
      lastUpdated: post.postLastUpdated,
      tags: post.postTags,
      reactions: post.postReactions,
      draft: post.postDraft,
      previousSaves: post.postPreviousSaves,
      heroImage: post.postHeroImage,
      multiMedia: post.postMultiMedia,
      embeddedHTML: post.postEmbeddedHTML,
      comments: post.postComments,
      category: post.postCategory,
      featured: post.postFeatured,
      loginhref: "login",
      login: "LOGIN",
      loginhref: "profile"
    });
  });
});
// post request for dynamic post routes
app.post("/post/:postId", function(req, res){
  const requestedPostId = req.params.postId;
  console.log("post updated: " + req.params.postId);
  const post = req.params.postId({
    title: post.title,
    content: post.content,
    author: post.postAuthor,
    dateCreated: req.body.postDateCreated,
    lastUpdated: req.body.postLastUpdated,
    tags: req.body.postTags,
    reactions: req.body.postReactions,
    draft: req.body.postDraft,
    previousSaves: req.body.postPreviousSaves,
    heroImage: req.body.postHeroImage,
    multiMedia: req.body.postMultiMedia,
    embeddedHTML: req.body.postEmbeddedHTML
  });
  // post route updates database
  post.updateOne(function(err){
    res.redirect("/blog");
  });
});
// app.use gets the static images with a different route
app.use("/syntaxes/:syntaxId", express.static('/public'));
// dynamic posts, based on Post Id retrieved from database
app.get("/syntaxes/:syntaxId", function(req, res){

const requestedSyntaxId = req.params.syntaxId;

  Syntax.findOne({_id: requestedSyntaxId}, function(err, syntax){
    res.render("syntax", {
      yyyy: getDate.getFullYear(),
      title: syntax.title,
      content: syntax.content,
      login: "PROFILE",
      loginhref: "login"
    });
  });

});
///////////////////////////////////
// Articles for Wiki set up
////////////////////////////////
// this is currently not used **
const articleSchema = {
  title: String,
  content: String
};

const Article = mongoose.model("Article", articleSchema);

///////////////////////////////////Requests Targetting all Articles////////////////////////

app.route("/articles")

.get(function(req, res){
  Article.find(function(err, foundArticles){
    if (!err) {
      res.send(foundArticles);
    } else {
      res.send(err);
    }
  });
})

.post(function(req, res){

  const newArticle = new Article({
    title: req.body.title,
    content: req.body.content
  });

  newArticle.save(function(err){
    if (!err){
      res.send("Successfully added a new article.");
    } else {
      res.send(err);
    }
  });
})

.delete(function(req, res){

  Article.deleteMany(function(err){
    if (!err){
      res.send("Successfully deleted all articles.");
    } else {
      res.send(err);
    }
  });
});

////////////////////////////////Requests Targetting A Specific Article////////////////////////

app.route("/articles/:articleTitle")

.get(function(req, res){

  Article.findOne({title: req.params.articleTitle}, function(err, foundArticle){
    if (foundArticle) {
      res.send(foundArticle);
    } else {
      res.send("No articles matching that title was found.");
    }
  });
})

.put(function(req, res){

  Article.update(
    {title: req.params.articleTitle},
    {title: req.body.title, content: req.body.content},
    {overwrite: true},
    function(err){
      if(!err){
        res.send("Successfully updated the selected article.");
      }
    }
  );
})

.patch(function(req, res){

  Article.update(
    {title: req.params.articleTitle},
    {$set: req.body},
    function(err){
      if(!err){
        res.send("Successfully updated article.");
      } else {
        res.send(err);
      }
    }
  );
})

.delete(function(req, res){

  Article.deleteOne(
    {title: req.params.articleTitle},
    function(err){
      if (!err){
        res.send("Successfully deleted the corresponding article.");
      } else {
        res.send(err);
      }
    }
  );
});

////////////////////////////////////////////////////////////
//////// STATIC PAGES ////////////////////////////////////
////////////////////////////////////////////////////////

app.get('/bootstrap',function(req,res){
  res.sendFile((path.join(__dirname + '/public/html/templates/webdesigns/bootstrap.html')));
});
app.get('/jquery',function(req,res){
  res.sendFile((path.join(__dirname + '/public/html/templates/webdesigns/jquery.html')));
});

///////////////////////////////////////
// converters
/////////////////////////////////
app.get('/jsonbeautify',function(req,res){
  res.sendFile((path.join(__dirname + '/public/html/converters/jsonbeautify.html')));
});
app.get('/statscanxml',function(req,res){
  res.sendFile((path.join(__dirname + '/public/html/xml-data-viewer/statscan.html')));
});
///////////////////////
//App listens on Port
/////////////////////
app.listen(port, function() {
  console.log("Server started on port: " +  port);
});

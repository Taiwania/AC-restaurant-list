// set mongoose, express and port
const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");

// set handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// import bootstrap, popper and URL encoder
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// dotenv
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Mongoose setting and connect the mongoDB
mongoose.set("useFindAndModify", false);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", () => {
  console.log("MongoDB is not connected.");
});

db.once("open", () => {
  console.log("MongoDB is connected!");
});

// import restaurant lists
const Restaurant = require("./models/restaurant");

// index
app.get("/", (req, res) => {
  Restaurant.find()
    .lean()
    .then((restaurants) => res.render("index", { restaurants }))
    .catch((error) => console.log(error));
});

// details
app.get("/restaurant/:id", (req, res) => {
  const RestaurantId = req.params.id;
  return Restaurant.findById(RestaurantId)
    .lean()
    .then((restaurant) => res.render("details", { restaurant: restaurant }))
    .catch((error) => console.log(error));
});

// show the new restaurant submit form
app.get("/new", (req, res) => {
  return res.render("submit");
});

// add new restaurant
app.post("/restaurant", (req, res) => {
  const newRestaurant = {
    name: req.body.name,
    name_en: req.body.name_en,
    category: req.body.category,
    location: req.body.location,
    google_map: req.body.google_map,
    image: req.body.image,
    phone: req.body.phone,
    rating: req.body.rating,
    description: req.body.description,
  };

  return Restaurant.create(newRestaurant)
    .then(() => res.redirect("/"))
    .catch((error) => console.log(error));
});

// Show the edit page
app.get('/restaurant/:id/edit', (req, res) => {
  const id = req.params.id
  return Restaurant.findById(id)
    .lean()
    .then(restaurant => res.render('edit', { restaurant }))
    .catch(error => console.log(error))
})

// Edit
app.post("/restaurant/:id/edit", (req, res) => {
  const id = req.params.id;
  const editedRestaurant = {
    name: req.body.name,
    name_en: req.body.name_en,
    category: req.body.category,
    location: req.body.location,
    google_map: req.body.google_map,
    image: req.body.image,
    phone: req.body.phone,
    rating: req.body.rating,
    description: req.body.description,
  };

  return Restaurant.findByIdAndUpdate(id, editedRestaurant)
    .then(() => res.redirect(`/restaurant/${id}`))
    .catch(error => console.log(error))
});

// Delete
app.post('/restaurant/:id/delete', (req, res) =>{
  const id = req.params.id
  Restaurant.findByIdAndDelete(id)
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// search
app.get("/search", (req, res) => {
  if (!req.query.keyword) {
    res.redirect("/");
  }

  const keyword = req.query.keyword.trim().toLocaleLowerCase();
  const filter = {
    $or: [
      { name: new RegExp(keyword, "i") },
      { category: new RegExp(keyword, "i") },
    ],
  };
  return Restaurant.find(filter)
    .lean()
    .then((restaurant) =>
      res.render("index", { restaurants: restaurant, keyword: keyword })
    )
    .catch((error) => console.log(error));
});

// online listener
app.listen(port, () => {
  console.log(`The website http://localhost:${port} is online.`);
});

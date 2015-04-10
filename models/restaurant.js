// connect to db
var mongoose = require('mongoose');

// defines the fields and datatypes we need for inserting a new restaurant
var RestaurantSchema = new mongoose.Schema({
	restaurantName: String,
	url: String,
	image: String,
	rating: Number,
	description: String
});

//export the restaurant schema to be used throughout the application
module.exports = mongoose.model('Restaurant', RestaurantSchema);
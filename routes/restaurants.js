// dependencies
var express = require('express');
var router = express.Router();

// db and model dependencies 
var mongoose = require('mongoose');
var Restaurant = require('../models/restaurant');

//image uploading dependencies 
var formidable = require('formidable');
var util = require('util');
var fs = require('fs-extra');

//credit card payment dependency
var stripe = require("stripe")("sk_test_6ylkK6n5ReMSdlZBhvhrLS8T");

// gets the add a restaurant page and shows the form
router.get('/restaurants/add', function (req,res,next) {
	res.render('add', {title: 'Assignment 2'});
});

//saves the new restaurant 
router.post('/restaurants/add', function (req, res, next) {
    var form = new formidable.IncomingForm();
    
    form.parse(req, function (err, fields, files) {

    });
	
	// variables for the input fields to the store data entered
	var restaurantName;
	var url;
	var rating;
	var description;
	
	// retrieves data from form and stores in appropriate variable
	form.on('field', function(name,value) {
		if(name == 'restaurantName') {
			restaurantName = value;
		}
		if (name == 'url') {
			url = value;
		}
			if (name == 'rating') {
			rating = value;
		}
			if (name == 'description') {
			description = value;
		}
	});
	
	// finds the path of the image file and saves it into public/images
    form.on('end', function(fields, files) {
   
        var tempPath = this.openedFiles[0].path;
        var fileName = this.openedFiles[0].name;
        var newLocation = 'public/images/'; 
        
        fs.copy(tempPath, newLocation + fileName, function(err) {
            if (err) {
                console.log(err);
            }
            else {
            // creates a new restaurant using the models file
			Restaurant.create({
				restaurantName: restaurantName,
				url: url,
				rating: rating,
				description: description,
				image: fileName
			}, function (err, Restaurant) {
				// if error shows the error
				if (err) {
					res.render('error', {error: err});	
				}
				// if no error loads the added.jade file
				else {
					res.render('added', {restaurant: Restaurant.name, title: 'Assignment 2'});	
				}
			});  
            } 
        }); 
    });
}); 

// shows the restaurant listings
router.get('/restaurants', function (req,res,next) {
	// finds all existing restaurants
	Restaurant.find(function (err, restaurants) {
		// if error shows the error
		if (err) {
			res.render('error', {error: err});	
		}	
		// if no error loads the restaurants.jade file with the existing restaurants data
		else {
			res.render('restaurants', {restaurants: restaurants, title: 'Assignment 2'});
		}
	});	
});

// deletes the restaurant
router.get('/restaurants/delete/:id', function (req,res,next) {
	var id = req.params.id;
	
	// gets the id
	Restaurant.remove({_id:id}, function (err, restaurant) {
		// if error sends the error
		if (err) {
			res.send('Could not find restaurant' + id);
		}	
		// if no error removes restaurant and reloads the page
		else {
			res.statusCode = 302;
			res.setHeader('Location','http://' + req.headers['host'] + '/restaurants');
			res.end();
		}
	});
});

// edits the restaurant
router.get('/restaurants/edit/:id', function (req,res,next) {
	var id = req.params.id;
	
	//gets the id
	Restaurant.findById(id, function (err, restaurant) {
		//if error sends the error
		if (err) {
			res.send('Could not find restaurant' + id);
		}
		//if no error loads the edit.jade page
		else {
			res.render('edit', {restaurant: restaurant, title: 'Assignment 2'});
		}
	});
});

// updates the restaurant
router.post('/restaurants/edit/:id', function (req,res,next) {
	var id = req.body.id;

	//recreates the existing restaurant with the updated data
	var restaurant = {
		_id: req.body.id,
		restaurantName: req.body.restaurantName,
		url: req.body.url,
		image: req.body.image,
		rating: req.body.rating,
		description: req.body.description
	}
	Restaurant.update({_id:id}, restaurant, function(err) {
		//if error sends the error
		if (err) {
			res.send('Error.' + err + req.body.id + 'Restaurant could not be updated');
		}	
		//if no error reloads the restaurant listings page
		else {
			res.statusCode = 302;
			res.setHeader('Location','http://' + req.headers['host'] + '/restaurants');
			res.end();
		}
	});
});

// shows the restaurant listings
router.get('/restaurants', function (req,res,next) {
	// finds all existing restaurants
	Restaurant.find(function (err, restaurants) {
		// if error shows the error
		if (err) {
			res.render('error', {error: err});	
		}	
		// if no error loads the restaurants.jade file with the existing restaurants data
		else {
			res.render('restaurants', {restaurants: restaurants, title: 'Assignment 2'});
		}
	});	
});


// gets the donation.jade page
router.get('/restaurants/donation/:id', function (req,res,next) {
	var id = req.params.id;
	
	//gets the id
	Restaurant.findById(id, function (err, restaurant) {
		//if error sends the error
		if (err) {
			res.send('Could not find restaurant' + id);
		}
		//if no error loads the donation.jade page
		else {
			res.render('donation', {restaurant: restaurant, title: 'Assignment 2'});
		}
	});
});

// calculates and stores the amount selected into appropriate variables to be used in checkout page
router.post('/restaurants/checkout', function (req,res,next) {
	var totalAmountCents = Math.round(parseFloat(req.body.Price * req.body.Qty)* 100); // converts the dollars to cents
	var totalAmountDollars = parseFloat((req.body.Price * req.body.Qty).toFixed(2));
	// renders checkout.jade and displays the total amount
	res.render('checkout', {title: 'Assignment 2', TotalAmountCents: totalAmountCents, TotalAmountDollars: totalAmountDollars});
});


// submits the credit information and ammount to the stripe account
router.post('/restaurants/donate', function (req,res,next) {
	var stripeToken = req.body.stripeToken;
	var charge = stripe.charges.create({
		amount: req.body.TotAmtCents,
		currency: "cad",
		card: stripeToken,
		description: 'This is a description'
	}, function(err, donate) {
		//if error shows the error
		if (err) {
			res.render('error', { title: 'Assignment 2', error: err } );	
		}
		//if no error loads the donated page
		else {
			res.render('donated', { title: 'Assignment 2' } );
		}
	});
});

// sends the data for all restaurants in an API request
router.get('/api/restaurants', function (req,res,next) {
	Restaurant.find(function (err, restaurant) {
		//if error sends the error
		if (err) {
			res.send(err);	
		}	
		//if no error sends restaurant data in JSON
		else {
			res.send(restaurant);
		}
	});
});

// sends the data for a specific restaurant using the id in an API request
router.get('/api/restaurants/:id', function (req,res,next) {
	var id = req.params.id;
	
	Restaurant.findById(id, function (err, restaurant) {
		//if error sends the error
		if (err) {
			res.send(err);
		}
		//if no error sends restaurant data in JSON
		else {
			res.send(restaurant);
		}
	});
});

// makes controller public
module.exports = router;
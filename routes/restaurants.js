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

// gets the add a restaurant page and shows the form
router.get('/restaurants/add', function (req,res,next) {
	res.render('add', {title: 'Assignment 2'});
});

//saves the new restaurant 
router.post('/restaurants/add', function (req, res, next) {
    var form = new formidable.IncomingForm();
    
    form.parse(req, function (err, fields, files) {

    });
	
	var restaurantName;
	var url;
	var rating;
	var description;
	
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

// sends the data for all restaurants in an API request
router.get('/api/restaurants', function (req,res,next) {
	Restaurant.find(function (err, restaurant) {
		if (err) {
			res.send(err);	
		}	
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
		else {
			res.send(restaurant);
		}
	});
});

// makes controller public
module.exports = router;
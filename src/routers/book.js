const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/User')
const auth = require('../middleware/auth')
const mongo = require('mongodb')

const router = express.Router()
const connection = mongoose.connection;

// List of books
router.get("/api/books", auth, async(req, res) => {
	try {
		if(req.user.role == 'student' || req.user.role == 'librarian') {
			const booksCollection = connection.db.collection("books");

		    booksCollection.find({}).toArray((error, results) => {
		        if(error) {
		            return res.status(500).send(error);
		        }
		        var newresults = [];

		        for(i=0;i<results.length;i++){
		        	const stock = new Object(results[i].stock);
		        	var available = 0;

		        	for(j=0;j<stock.length;j++){
		        		if (stock[j].status == 'available') {
		        			available++;
		        		}
		        	}

		        	newresults.push({
		        		id: results[i]._id,
			        	title: results[i].title,
			        	author: results[i].author,
			        	published_year: results[i].published_year,
			        	genre: results[i].genre,
			        	stock: available == 0 ? 0 : stock.length,
			        	available: available
		        	});
            	}

		        res.send(newresults);
		    });

		} else {
			return res.status(403).send({error: 'Access to the requested resource is forbidden!'})
		}
	} catch (error) {
        res.status(400).send(error)
    }
});

// Add new book
router.post("/api/book", auth, async(req, res) => {
	try {
		if(req.user.role == 'librarian') {
			const booksCollection = connection.db.collection("books");

			const book = {
				title: req.body.title,
				author: req.body.author,
				published_year: req.body.published_year,
				genre: req.body.genre
			};

		    booksCollection.insertOne(book, (error, result) => {
		        if(error) {
		            return res.status(500).send(error);
		        }
		        res.send(result);
		    });
		} else {
			return res.status(403).send({error: 'Access to the requested resource is forbidden!'})
		}
	} catch (error) {
        res.status(400).send(error)
    }
});

// Update stock status
router.patch("/api/book/:bookId/:stockId", auth, async(req, res) => {
	try {
		if(req.user.role == 'student' || req.user.role == 'librarian') {
			const booksCollection = connection.db.collection("books");
			
			const myquery = { 
				'_id': mongoose.Types.ObjectId(req.params.bookId),
				'stock._id': mongoose.Types.ObjectId(req.params.stockId)
			};
			
			var newvalues = { 
				$set: { 
					'stock.$.status': req.body.status 
				}
			};

		    booksCollection.updateOne(myquery, newvalues, (error, result) => {
		        if(error) {
		            return res.status(500).send(error);
		        }
		        res.send(result);
		    });
		} else {
			return res.status(403).send({error: 'Access to the requested resource is forbidden!'})
		}
	} catch (error) {
        res.status(400).send(error)
    }
});

module.exports = router
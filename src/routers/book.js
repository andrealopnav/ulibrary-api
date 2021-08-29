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
			        	stock: results[i].stock,
			        	stock_qty: available == 0 ? 0 : stock.length,
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

// List of stock in book
router.get("/api/book/stock", auth, async(req, res) => {
	try {
		if(req.user.role == 'student' || req.user.role == 'librarian') {
			const booksCollection = connection.db.collection("books");
			const bookId = mongoose.Types.ObjectId(req.body.book_id);

		    booksCollection.findOne({_id: bookId}, (error, result) => {
		        if(error) {
		            return res.status(500).send(error);
		        }
		        
		        const stock = new Object(result.stock);
		        var available = 0;

		        for(i=0;i<stock.length;i++){
		        	if (stock[i].status == 'available') {
		        		available++;
		        	}
		        }

		        const newresult = {
		        	id: result._id,
			       	title: result.title,
			       	author: result.author,
			       	stock: result.stock,
			       	stockqty: available == 0 ? 0 : stock.length,
			       	available: available
		        };

		        res.send(newresult);
		    });

		} else {
			return res.status(403).send({error: 'Access to the requested resource is forbidden!'})
		}
	} catch (error) {
        res.status(400).send(error)
    }
});

// Update stock status
router.patch("/api/book/stock", auth, async(req, res) => {
	try {
		if(req.user.role == 'student' || req.user.role == 'librarian') {
			const booksCollection = connection.db.collection("books");
			const stockCollection = connection.db.collection("stock");
			var status = req.body.status;

			if (status == 'returned') {
				const myquery1 = { 
					'_id': mongoose.Types.ObjectId(req.body.hist_id)
				};
			
				var newvalues1 = { 
					$set: { 
						'status': status 
					}
				};

				stockCollection.updateOne(myquery1, newvalues1, (error, result) => {
			    	if(error) {
			        	return res.status(500).send(error);
			    	}
				});	

				status = 'available';		

			} else {
				const stock = {
					book_id: req.body.book_id,
					stock_id: req.body.stock_id,
					user_id: req.body.user_id,
					status: status,
					date: new Date()
				};

			    stockCollection.insertOne(stock, (error, result) => {
			        if(error) {
			            return res.status(500).send(error);
			        }
			    });
			}

		    const myquery2 = { 
				'_id': mongoose.Types.ObjectId(req.body.book_id),
				'stock._id': mongoose.Types.ObjectId(req.body.stock_id)
			};
			
			var newvalues2 = { 
				$set: { 
					'stock.$.status': status 
				}
			};

			booksCollection.updateOne(myquery2, newvalues2, (error, result) => {
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

// List of reservation/rents - user
router.get("/api/book/re/user", auth, async(req, res) => {
	try {
		if(req.user.role == 'student' || req.user.role == 'librarian') {
			const stockCollection = connection.db.collection("stock");
			
			stockCollection.find({user_id: req.body.user_id}).toArray((error, results) => {
		        if(error) {
		            return res.status(500).send(error);
		        }
		        res.send(results);
		    });

		} else {
			return res.status(403).send({error: 'Access to the requested resource is forbidden!'})
		}
	} catch (error) {
        res.status(400).send(error)
    }
});

module.exports = router
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 5000;




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aa0ccjg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDatabase() {
    try {
      await client.connect();
      console.log("Connected to MongoDB!");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
}
connectDatabase();

//Insert data to server req from Client side
app.post('/addProduct', async (req, res) => {
    try {
      const product = req.body;
      const db = client.db(`${process.env.DB_NAME}`);
      const coll = db.collection(`${process.env.DB_COLL}`);
      
      const result = await coll.insertOne(product);
      
      if (result.insertedCount === 1) {
        res.send(201).json({ message: 'Product added successfully' });
      } else {
        res.status(500).json({ message: 'Failed to add product' });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


//Read Data from server
app.get('/getProducts', async (req, res) => {
    try {
      const db = client.db(`${process.env.DB_NAME}`);
      const coll = db.collection(`${process.env.DB_COLL}`);
      
      // Retrieve all products from the collection
      const products = await coll.find().limit(20).toArray();
      res.send(products);
      
      console.log('Data Load Successfully');
    } catch (error) {
      console.error("Error retrieving products:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  //Read Data from server
app.get('/getAllProducts', async (req, res) => {
  try {
    const db = client.db(`${process.env.DB_NAME}`);
    const coll = db.collection(`${process.env.DB_COLL}`);
    
    // Retrieve all products from the collection
    const products = await coll.find().toArray();
    res.send(products);
    
    console.log('Data Load Successfully');
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Delete item 
app.delete('/deleteProductById/:id', async (req, res) => {
  const deleteProductId = req.params.id; // Get the ID to delete from the URL
  try {
    const db = client.db(process.env.DB_NAME);
    const coll = db.collection(process.env.DB_COLL);

    // Delete the product with the specified ID
    const result = await coll.deleteOne({ _id: new ObjectId (deleteProductId )});

    if (result.deletedCount === 1) {
      // If deletedCount is 1, it means the item was found and deleted
      console.log(`Product with ID ${deleteProductId} deleted successfully.`);
      res.status(204).send(deleteProductId); // Respond with a 204 No Content status
    } else {
      // If deletedCount is not 1, it means the item was not found
      console.log(`Product with ID ${deleteProductId} not found.`);
      res.status(404).json({ message: `Product with ID ${deleteProductId} not found` });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//update product information
app.patch('/updatedProductById/:id', async (req, res) => {
  const updateProductId = req.params.id;
  console.log(req.body.updateProductId); // Get the ID to update from the URL
  // const { category, name, price, stock } = req.body.updatedProduct; // Get updated fields from the request body

  try {
    const db = client.db(process.env.DB_NAME);
    const coll = db.collection(process.env.DB_COLL);

    // Construct the update object with the fields you want to update
    const updateObject = {
      $set: {
        category: req.body.category,
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock
      }
    };

    // Update the product with the specified ID
    const result = await coll.updateOne({ _id: new ObjectId(updateProductId) }, updateObject);

    if (result.matchedCount === 1) {
      // If matchedCount is 1, it means the item was found and updated
      console.log(`Product with ID ${updateProductId} updated successfully.`);
      res.status(204).send(); // Respond with a 204 No Content status
    } else {
      // If matchedCount is not 1, it means the item was not found
      console.log(`Product with ID ${updateProductId} not found.`);
      res.status(404).json({ message: `Product with ID ${updateProductId} not found` });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Add a route to find data by ID
app.get('/getProductById/:id', async (req, res) => {
    try {
      const productId = req.params.id;  // Retrieve the ID from the URL parameter
      const db = client.db(process.env.DB_NAME);
      const coll = db.collection(process.env.DB_COLL);
  
      // Query the database to find the data by ID
      const product = await coll.findOne({ _id: new ObjectId (productId)})
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Send the retrieved data as a JSON response
      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  


//Listen Port Configuration
app.listen(port, () => {
    console.log(`server run at http://localhost:${port}`);
});
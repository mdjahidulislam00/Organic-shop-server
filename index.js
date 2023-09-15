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

    // Convert the ID to ObjectId if needed, assuming it's a MongoDB ObjectId
    // const deleteObjectId = new ObjectId(deleteProductId);

    // Delete the product with the specified ID
    const result = await coll.deleteOne({ id: (deleteProductId )});

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



// Add a route to find data by ID
app.get('/getProductById/:id', async (req, res) => {
    try {
      const productId = req.params.id; // Retrieve the ID from the URL parameter
      console.log(productId);
      const db = client.db(process.env.DB_NAME);
      const coll = db.collection(process.env.DB_COLL);
  
      // Query the database to find the data by ID
      const product = await coll.findOne({ id: (productId)})
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
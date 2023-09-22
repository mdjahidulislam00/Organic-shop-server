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

//Connect to Database
async function connectDatabase() {
    try {
      await client.connect();
      console.log("Connected to MongoDB!");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
}
connectDatabase();

// Insert data to MongoDB Atlas
app.post('/addProduct', async (req, res) => {
  console.log(req.body);
  try {
    const product = req.body;
    const db = client.db(process.env.DB_NAME);
    const coll = db.collection(process.env.DB_COLL);
    
    const result = await coll.insertOne(product);
    
    if (result.insertedCount === 1) {
      res.status(201).json({ message: 'Product added successfully' });
    } else {
      res.status(500).json({ message: 'Failed to add product' });
    }
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//Read ALL Data from server
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


//Read 20 Data from server
app.get('/getProducts', async (req, res) => {
  try {
    const db = client.db(`${process.env.DB_NAME}`);
    const coll = db.collection(`${process.env.DB_COLL}`);
    
    const products = await coll.find().limit(20).toArray();
    res.send(products);
    
    console.log('Data Load Successfully');
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// find 1 data by Id
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


// Delete Data by Id
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


//update product information by Id
app.patch('/updatedProductById/:id', async (req, res) => {
  console.log(req.body.name);
  const updateProductId = req.params;
  console.log(updateProductId);
  try {
    const db = client.db(process.env.DB_NAME);
    const coll = db.collection(process.env.DB_COLL);

    const updateObject = {
      $set: {
        category: req.body.category,
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock
      }
    };

    const result = await coll.updateOne({ _id: new ObjectId(updateProductId) }, updateObject);

    if (result.matchedCount === 1) {
      console.log(`Product with ID ${updateProductId} updated successfully.`);
      res.status(204).send(); 
    } else {
      console.log(`Product with ID ${updateProductId} not found.`);
      res.status(404).json({ message: `Product with ID ${updateProductId} not found` });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Insert Data for Order
app.post('/addOrder', async (req, res) => {
  try {
    const product = req.body;
    const db = client.db(process.env.DB_NAME);
    const coll = db.collection('userOrder');
    
    const result = await coll.insertOne(product);
    
    if (result.insertedCount === 1) {
      res.status(201).json({ message: 'Product added successfully' });
    } else {
      res.status(500).json({ message: 'Failed to add product' });
    }
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//get order by email
app.get('/getProductByEmail/:email', async (req, res) => {
  try {
    const userEmail = req.params.email; // Corrected parameter name
     // Retrieve the email from the URL parameter
    const db = client.db(process.env.DB_NAME);
    const coll = db.collection('userOrder');

    // Query the database to find the data by email
    const orderEmail = await coll.findOne({ email: userEmail }); // Use userEmail here
    if (!orderEmail) {
      return res.status(404).json({ message: 'order not found' });
    }

    // Send the retrieved data as a JSON response
    res.status(200).json(orderEmail);
  } catch (error) {
    console.error('Error fetching order by email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//Listen Port Configuration
app.listen(port, () => {
    console.log(`server run at http://localhost:${port}`);
});
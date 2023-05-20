const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.towmtg1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client
      .db("toyMarketplaceDB")
      .collection("toyProducts");

    //   Getting data from server with 20 limit
    app.get("/allToys", async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const result = await toyCollection.find().limit(limit).toArray();
      res.send(result);
    });

    //   Getting category filtered data
    app.get("/categoryFiltered", async (req, res) => {
      const category = req.query.category;

      const result = await toyCollection
        .find({ subCategory: category })
        .toArray();
      res.send(result);
    });

    //   Search by Toy name
    app.get("/getToyBySearch", async (req, res) => {
      const name = req.query.name;
      const result = await toyCollection
        .find({
          $or: [{ productName: { $regex: name, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    //   Get Single Data by Id
    app.get("/singleToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const result = await toyCollection.find(filter).toArray();
      res.send(result);
    });

    //   Get toys data by user
    app.get("/myToys", async (req, res) => {
      const user = req.query.user;

      const result = await toyCollection.find({ sellerEmail: user }).toArray();
      res.send(result);
    });

    //   Adding data to server
    app.post("/addToys", async (req, res) => {
      const formData = req.body;

      const result = await toyCollection.insertOne(formData);
      res.send(result);
    });

    //   Updating toy info
    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          price: updateData.price,
          availableQuantity: updateData.availableQuantity,
          detailsDescription: updateData.detailsDescription,
        },
      };
      const result = await toyCollection.updateOne(filter, updatedDoc);
      console.log(result);
      res.send(result);
    });

    //   Deleting toy
    app.delete("/deleteToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(filter);

      console.log(result);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Initial setup
app.get("/", (req, res) => {
  res.send("Toy marketplace server is running successfully");
});

app.listen(port, () => {
  console.log(`${port} port is running...`);
});

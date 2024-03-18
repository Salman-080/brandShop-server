const express=require('express');
const cors=require('cors');
const app=express();

app.use(cors());
app.use(express.json());

const port=process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.get("/",(req,res)=>{
    res.send("The Brand Shop Server Site");
})

app.listen(port,(req,res)=>{
    console.log(`app running on port ${port}`);
})






//const uri = "mongodb+srv://<username>:<password>@cluster0.pfweqj8.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pfweqj8.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const foodCollections=client.db('foodDB').collection('foodStore');
    const cartCollections=client.db('foodDB').collection('cartStore');

    app.post("/products",async(req,res)=>{
        const item=req.body;
        console.log(item);
        const result=await foodCollections.insertOne(item);
        res.send(result);
    })

    app.get("/products/:brandName",async(req,res)=>{
      const brandName=req.params.brandName;
      console.log(brandName);

      const query={brandName: brandName};
      const cursor= foodCollections.find(query);
      const result= await cursor.toArray();

      res.send(result);
      
    })

    app.get("/:productId",async(req,res)=>{
      const productId= req.params.productId;
      console.log(productId);
      const query= {_id: new ObjectId(productId)};
     
      const result= await foodCollections.findOne(query);
      res.send(result);
      
    })

    //cart
    app.post("/product/cart/:userEmail",async(req,res)=>{
      const email=req.params.userEmail;
      console.log(email)
      const productData=req.body;
      console.log(productData)

      const fullData={
        userEmail: email,
        ...req.body
      }

      const result=await cartCollections.insertOne(fullData);
      res.send(result);
    })

    app.get("/product/cart/:userEmail",async(req,res)=>{
      const email=req.params.userEmail;
      console.log(email)
      const query= {userEmail: email}
      const cursor=cartCollections.find(query);
      const result= await cursor.toArray();
      res.send(result);
    })

    app.delete('/product/cart/:id',async(req,res)=>{
      const id=req.params.id;
      console.log(id);

      const query={_id: new ObjectId(id)};

      const result= await cartCollections.deleteOne(query);
      res.send(result);
    })

    //update

    app.get("/update/:id",async(req,res)=>{
      const id=req.params.id;
      console.log(id);

      const query={_id:new ObjectId(id)};
      const result=await foodCollections.findOne(query);
      res.send(result);
    })

    app.put("/update/:id",async(req,res)=>{
      const id=req.params.id;
      console.log(id)
      const updateProduct=req.body;
      console.log(updateProduct)

      const filter={_id: new ObjectId(id)};

      const updatingProduct = {
        $set: {
          productName: updateProduct.productName,
          brandName: updateProduct.brandName,
          productType: updateProduct.productType,
          price: updateProduct.price,
          shortDescription: updateProduct.shortDescription,
          rating: updateProduct.rating,
          image: updateProduct.image,
        },
      };

      const result= await foodCollections.updateOne(filter, updatingProduct);
      res.send(result);
    })

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

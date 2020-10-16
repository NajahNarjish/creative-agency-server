const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require("fs-extra");
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jw6hg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('addService'));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) =>{
    res.send("hello! its working.")
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ordersCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("review");
  const serviceCollection = client.db("creativeAgency").collection("service");
  const adminCollection = client.db("creativeAgency").collection("admin");

  
  app.post("/addOrder", (req,res)=>{
      const order = req.body;
      ordersCollection.insertOne(order)
      .then(result => {
          res.send(result.insertedCount > 0)
      })
  });

  app.get("/showOrders", (req, res) => {
    ordersCollection.find({email: req.query.email})
    .toArray((err, documents) => {
        res.send(documents);
    })
});

app.post("/addReview", (req,res)=>{
    const review = req.body;
    reviewCollection.insertOne(review)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
});
app.get("/reviews", (req, res) => {
    reviewCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
});

//fakedata for previous reviews
app.post("/addAllReviews", (req, res) => {
    const allReviews = req.body;
    reviewCollection.insertMany(allReviews)
    .then(result => {
        res.send(result.insertedCount)
    })
});

//all orders in a list to admin
app.get("/showAllServiceList", (req, res) => {
    ordersCollection.find({})
    .toArray((err, documents) => { 
        res.send(documents);
    })
});

//new service added by admin
app.post('/addAService', (req, res) => {
    const file = req.files.file;
    const title= req.body.title;
    const description = req.body.description;
    
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    serviceCollection.insertOne({ title, description, image })
        .then(result => {
                res.send(result.insertedCount > 0);
            });
});

//fakedata for previous services
app.post("/addAllServices", (req, res) => {
    const allServices = req.body;
    serviceCollection.insertMany(allServices)
    .then(result => {
        res.send(result.insertedCount)
    })
});
app.get("/services", (req, res) => {
    serviceCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
});
//insert in admin collection
app.post("/addAdmin", (req,res)=>{
    const admin = req.body;
    adminCollection.insertOne(admin)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
});
//check for admin only
app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
        .toArray((err, admin) => {
            res.send(admin.length > 0);
        })
})

});

app.listen(process.env.PORT || port)
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require('cors');
const app = express();
app.set('view engine', 'ejs');
mongoose.connect(process.env.MONGO, { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static("public"));
app.use(cors());
// Verilənlər bazası modelləri tənzimləmələri
const category = new mongoose.Schema({
  name: String,
  type: String
})
const Category = mongoose.model("Category", category);

const requestSchema = new mongoose.Schema({
  id: Number,
  action: Number,
  req: String,
  dir: String
})
const Request = mongoose.model("Request", requestSchema);

const thing = new mongoose.Schema({
  name: String,
  category: String,
  type: String,
  targeted: Number,
  id: Number
})
const Thing = mongoose.model("Thing", thing);
app.get("/addname", (req, res) => {
  res.render("category");
});
// Yeni kateqoriya yaratmaq 
app.post("/createcat1", (req, res) => {
  const name = req.body.name;
  const newCat = new Category({
    name: name,
    type: "category"
  })
  newCat.save();
  res.redirect("/addrooms/" + name);
});

app.get("/addrooms/:category", (req, res) => {
  const category = req.params.category;
  res.render("room", { category: category })
})

app.post("/finishcat/:category", (req, res) => {
  const category = req.params.category;
  const appletName = req.body.name;

  var randomId = Math.floor(Math.random() * 90000) + 10000;

  const newThing = new Thing({
    name: appletName,
    category: category,
    type: "thing",
    targeted: 0,
    id: randomId
  })
  newThing.save();
  res.redirect("/addrooms/" + category);

})
// Home
app.get("/home", (req, res) => {
  res.render("home");
})
//Kateqoriyalar
app.get("/", async (req, res) => {
  const categories = await Category.find();
  res.render("index", { categories: categories });
})
// Əşyalar
app.get("/things", async (req, res) => {
  const name = req.query.name;
  const categories = await Thing.find({ category: name });
  res.render("index", { categories: categories });
})
// API-lar
app.get("/api/getrequest", async (req, res) => {
  const request = await Request.find();
  const data = {
    id: request[0].id,
    action: request[0].action
  };
  res.json(data);
})


app.get("/api/dir/set", async (req, res) => {
  const direction = req.query.direction;

  try {
    const updatedDocument = await Request.findOneAndUpdate(
      { req: "dir" },
      { dir: direction },
      { new: true }
    );
    if (!updatedDocument) {
      return res.status(404).send({ error: "Document not found" });
    }

    res.send(updatedDocument);
  }
  catch (err) {
    console.log(err);
  }

})


app.get("/api/dir/get", async (req, res) => {


  try {
    const data = Request.findOne({ req: "dir" })
      .then(result => {
        const datajson = {
          direction: result.dir
        }
        res.json(datajson);
      })

  }
  catch (err) {
    console.log(err);
  }

})








app.get("/detect", (req, res) => {
  res.render("detector");
})


app.get("/api/updaterequest", async (req, res) => {
  const newId = req.query.newId;
  var result;

  try {
    const found = await Thing.findOne({ id: newId });
    console.log(found);
    if (found.targeted == 0) {
      await Thing.updateOne({ id: newId }, { targeted: 1 })
        .then(result => {

        })
        .catch(err => {
          console.error('Error updating user:', err);
        });

      const message = {
        id: newId,
        action: 1
      }
      await Request.updateOne({ req: "req" }, { id: newId, action: 1 })
        .then(result => {

        })
        .catch(err => {
          console.error('Error updating user:', err);
        });
      res.json(message);



    }
    else if (found.targeted == 1) {
      await Thing.updateOne({ id: newId }, { targeted: 0 })
        .then(result => {

        })
        .catch(err => {
          console.error('Error updating user:', err);
        });

      const message = {
        id: newId,
        action: 0
      }
      await Request.updateOne({ req: "req" }, { id: newId, action: 0 })
        .then(result => {

        })
        .catch(err => {
          console.error('Error updating user:', err);
        });
      res.json(message);

    }
  } catch (error) {
    console.log(error);
  }






})

app.listen(3000, () => {
  console.log("listening on 3000")
})

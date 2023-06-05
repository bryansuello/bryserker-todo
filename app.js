//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

//mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', {
//replace <password> with real db password. Must remove the ?retryWrites=true&w=majority part
mongoose.connect('mongodb+srv://bryansuello:ukr1zjct5@cluster0.9bhawvq.mongodb.net/todolistDB', {
  useNewUrlParser: true,
});

const itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = new mongoose.model('Item', itemsSchema);
const item1 = new Item({
  name: 'Welcome to your todolist!',
});
const item2 = new Item({
  name: 'Hit the + button to add a new item.',
});
const item3 = new Item({
  name: '<-- Hit this to delete and item.',
});
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = new mongoose.model('List', listSchema);

app.get('/', function (req, res) {
  //res.render("list", {listTitle: "Today", newListItems: foundItems})

  Item.find({})
    .then(foundItems => {
      //only runs once(if collection is empty, so list don't get repeated)
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log('Successfully saved default items to DB');
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect('/');
      } else {
        res.render('list', { listTitle: 'Today', newListItems: foundItems });
      }
    })
    .catch(err => {
      console.error(err);
    });
});

app.post('/', async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  // if (listName === 'Today') {
  //   item.save();
  //   res.redirect('/');
  // } else {
  //   List.findOne({ name: listName });
  // }
  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  } else {
    await List.findOne({ name: listName })
      .exec()
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' + listName);
      });
  }

  // if (req.body.list === 'Work') {
  //   workItems.push(item);
  //   res.redirect('/work');
  // } else {
  //   items.push(item);
  //   res.redirect('/');
  // }
});

// async keyword location
// app.post('/delete', async (req, res) => {
//   const checkedItemId = req.body.checkbox;
//   const listName = req.body.listName;

//   if (listName === 'Today') {
//     if (checkedItemId != undefined) {
//       await Item.findByIdAndRemove(checkedItemId)
//         .then(() => console.log(`Deleted ${checkedItemId} Successfully`))
//         .catch(err => console.log('Deletion Error: ' + err));
//       res.redirect('/');
//     }
//   } else {
//     await List.findOneAndUpdate(
//       { name: listName },
//       { $pull: { items: { _id: checkedItemId } } }
//     );
//     console.log(`Deleted ${checkedItemId} Successfully`);
//     res.redirect('/' + listName);
//   }
// });

app.post('/delete', async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  // Print the name of the list to the console for debugging purposes.
  console.log('the list name is: ' + listName);

  // If the list name is "Today", remove the item from the database and redirect to the home page.
  // Otherwise, find the corresponding list in the database and remove the item from it.
  if (listName === 'Today') {
    if (checkedItemId != undefined) {
      await Item.findByIdAndRemove(checkedItemId);
      console.log(`Deleted ${checkedItemId} Successfully`);
      res.redirect('/');
    }
  } else {
    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    );
    console.log(`Deleted ${checkedItemId} Successfully`);
    res.redirect('/' + listName);
  }
});

// app.get('/work', function (req, res) {
//   res.render('list', { listTitle: 'Work List', newListItems: workItems });
// });

// app.get('/:customListName', (req, res) => {
//   const customListName = req.params.customListName;
//   const list = new List({
//     name: customListName,
//     items: defaultItems,
//   });
//   list.save();
// });

app.get('/about', function (req, res) {
  res.render('about');
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});

app.get('/:customListName', function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(foundList => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect('/' + customListName);
      } else {
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

// SIMPLER WORKING
// const defaultItems = [item1, item2, item3];

// const listSchema = {
//   name: String,
//   items: [itemsSchema]
// };

// const List = mongoose.model("List", listSchema);

// app.get("/", function(req, res) {

//   //res.render("list", {listTitle: "Today", newListItems: foundItems})

//   Item.find({})
//     .then(foundItems => {

//       if (foundItems.length === 0) {
//         Item.insertMany(defaultItems).then(function () {
//           console.log("Successfully saved default items to DB");
//         })
//         .catch(function (err) {
//           console.log(err);
//         });
//         res.redirect("/");
//       } else {
//         res.render("list", {listTitle: "Today", newListItems: foundItems});
//       }

//     })
//     .catch(err => {
//       console.error(err);
//     });

// });

// app.get("/:customListName", function(req, res){
//   const customListName = req.params.customListName;

//   List.findOne({name: customListName})
//     .then(foundList => {
//       if(!foundList){

//         const list = new List({
//           name: customListName,
//           items: defaultItems
//         });

//         list.save();
//         res.redirect("/" + customListName);
//       } else {
//         res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//     });

// });

// app.post("/", function(req, res){

//   const itemName = req.body.newItem;

//   const item = new Item({
//     name: itemName
//   });

//   item.save();
//   console.log("Added New Item");
//   res.redirect("/");
// });

// app.post("/delete", function(req, res){
//   const checkedItemId = req.body.checkbox;

//   Item.findByIdAndRemove(checkedItemId)
//     .then(() => {
//       console.log("Successfully deleted checked item from the database");
//       res.redirect("/");
//     })
//     .catch((err) => {
//       console.log(err);
//     });

// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });

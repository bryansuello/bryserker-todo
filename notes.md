First of all, you should know that I kept it readable

Secondly, there's a Model.js file that contains our Schemas, model objects, and an array

This is not how I recommend writing your code without error-handlers

If you want to see how I wrote my code I'll paste it into the comment

app.js

const express = require("express");
const mongoose = require("mongoose");
const { Item, List, defaultItems } = require("./Model");
const \_ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

app.get("/", async function (req, res) {
const foundItems = await Item.find({});

if (!(await Item.exists())) {
await Item.insertMany(defaultItems);
res.redirect("/");
} else {
res.render("list", { listTitle: "Today", newListItems: foundItems });
}
});

app.get("/:customListName", async function (req, res) {
const customListName = \_.capitalize(req.params.customListName);
const foundList = await List.findOne({ name: customListName });

if (!foundList) {
const list = new List({
name: customListName,
items: defaultItems,
});
await list.save();
res.redirect("/" + customListName);
} else {
res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
}
});

app.post("/", async function (req, res) {
const itemName = req.body.newItem;
const listName = req.body.list;

const newItem = new Item({
name: itemName,
});

if (listName === "Today") {
await newItem.save();
res.redirect("/");
} else {
const foundList = await List.findOne({ name: listName });
foundList.items.push(newItem);
await foundList.save();
res.redirect("/" + listName);
}
});

app.post("/delete", async function (req, res) {
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if (listName === "Today" && checkedItemId != undefined) {
await Item.findByIdAndRemove(checkedItemId);
res.redirect("/");  
 } else {
await List.findOneAndUpdate( { name: listName },
{ $pull: { items: { \_id: checkedItemId } } } );
res.redirect("/" + listName);
}
});
app.get("/about", function (req, res) { res.render("about") });

app.listen(3000, function () {
console.log("Server started on port 3000");
});
Model.js

// Requiring module
const mongoose = require("mongoose");

// Items modal Schema
const itemsSchema = new mongoose.Schema({
name: String,
});

// Lists modal Schema
const listSchema = {
name: String,
items: [itemsSchema],
};

// Creating model objects
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

// Creating the default items array!
const item1 = new Item({
name: "Welcome to your todolist!",
});
const item2 = new Item({
name: "Hit the + button to add a new item.",
});
const item3 = new Item({
name: "<== Hit this box to delete an item.",
});

const defaultItems = [item1, item2, item3];

// Exporting our model objects and an array
module.exports = {
Item,
List,
listSchema,
defaultItems
};
Hope this helps :)

1 reply

Abdallah
0 upvotes
28 days ago
// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const { Item, List, defaultItems } = require("./Model");
const \_ = require("lodash");

// Create an Express application
const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");

// Use integrated body-parser to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Connect to the database
main().catch((err) => console.log(err));
async function main() {
await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
}

app.get("/", async function (req, res) {
// Find all items in the Item collection
const foundItems = await Item.find({});

// If there are no items in the collection, insert the default items
if (!(await Item.exists())) {
try {
await Item.insertMany(defaultItems);
console.log("Insertion successful");
res.redirect("/");
} catch (error) {
console.log("Insertion failed: ", error);
}
} else {
res.render("list", { listTitle: "Today", newListItems: foundItems });
}
});

app.get("/:customListName", async function (req, res) {
const customListName = \_.capitalize(req.params.customListName);

// Check if a list with the given name exists in the database, if not creat one
const foundList = await List.findOne({ name: customListName });
if (!foundList) {
try {
console.log(customListName + " not found, creating new list...");
const list = new List({
name: customListName,
items: defaultItems,
});
await list.save();
console.log("New list has been created and saved to the database.");
res.redirect("/" + customListName); // Redirect the user to the new list's page
} catch (error) {
console.log("Error fail saving new list to the database:", err);
}
} else {
// else If the list exists, render its items to the list view
// console.log("List already exists.");
res.render("list", { listTitle: foundList.name, newListItems: foundList.items, });
}
});

// The request body contains a new item to be added to a list.
app.post("/", async function (req, res) {
const itemName = req.body.newItem;
const listName = req.body.list;
// Print the name of the list to the console for debugging purposes.
console.log("the list name is " + listName);

// Create a new Item object with the name of the new item.
const newItem = new Item({
name: itemName,
});

// If the list name is "Today", add the new item to the database and redirect to the home page.
// Otherwise, find the corresponding list in the database and add the new item to it.
if (listName === "Today") {
try {
await newItem.save();
console.log("New item has been added to the database: " + itemName);
res.redirect("/");
} catch (error) {
console.log("Error fail adding new item to database: ", error);
}
} else {
const foundList = await List.findOne({ name: listName });
if (!foundList) {
console.log(`List ${listName} not found.`);
console.log("the list name is: " + listName);
}
try {
foundList.items.push(newItem);
await foundList.save();
console.log("New item has been added to the database: " + itemName);
res.redirect("/" + listName);
} catch (error) {
console.log("Error fail adding new item to database: ", error);
}
}
});

// The request body contains the ID of the item to be deleted from a list.
app.post("/delete", async function (req, res) {
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

// Print the name of the list to the console for debugging purposes.
console.log("the list name is: " + listName);

// If the list name is "Today", remove the item from the database and redirect to the home page.
// Otherwise, find the corresponding list in the database and remove the item from it.
if (listName === "Today") {
if (checkedItemId != undefined) {
await Item.findByIdAndRemove(checkedItemId);
console.log(`Deleted ${checkedItemId} Successfully`);
res.redirect("/");
}
} else {
await List.findOneAndUpdate(
{ name: listName },
{ $pull: { items: { \_id: checkedItemId } } }
);
console.log(`Deleted ${checkedItemId} Successfully`);
res.redirect("/" + listName);
}
});

app.get("/about", function (req, res) {
res.render("about");
});
app.listen(3000, function () {
console.log("Server started on port 3000");
});
This will interact with you as you're testing it

And it will help you when u run into an error!

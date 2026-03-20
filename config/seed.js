require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('./database');
const { Nation } = require('../models/nation');
const { Food }= require('../models/food');
const { User } = require('../models/user');

const nationsData = require('../data/nations.json');
const foodsData = require('../data/foods.json');
const usersData = require('../data/users.json');

const seedData = async () => {
  try {
    await connectDB();

    // clear db
    await Nation.deleteMany({});
    await Food.deleteMany({});
    await User.deleteMany({});

    const nations = nationsData.map(n => ({
      ...n,
      _id: n._id ? new mongoose.Types.ObjectId(n._id.$oid) : undefined
    }));

    // convert _id + map nation for food
    const foods = foodsData.map(food => ({
      ...food,
      _id: food._id ? new mongoose.Types.ObjectId(food._id.$oid) : undefined,
      nation: food.nation && food.nation.$oid ? new mongoose.Types.ObjectId(food.nation.$oid) : undefined
    }))
    await Food.insertMany(foods);

    // insert users
    const users = usersData.map(u => ({
      ...u,
      _id: u._id ? new mongoose.Types.ObjectId(u._id.$oid) : undefined
    }));
    await User.insertMany(users);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedData();
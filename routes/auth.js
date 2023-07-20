const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser=require('../middleware/fetchUser');

const JWT_SECRET = "Piyushisagood$boy";

//ROUTE 1:
// Create a user POST API (/api/auth/) (Sign-up)
// Putting validation for inputs.
router.post('/createuser', [
  body('name').notEmpty().withMessage('Enter a valid name').isLength({ min: 3 }),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password must contain at least 6 characters')
], async (req, res) => {
  let success=false;
  console.log(req.body);

  // If there are errors, return bad request and errors.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }

  try {
    // Destructuring
    const { name, email, password } = req.body;

    // Check if a user with the same email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({success, error: "Sorry, a user with the same email already exists" });
    }

    // Create a new user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const data = {
      user: {
        id: user.id
      }
    };

    const authToken = jwt.sign(data, JWT_SECRET);
    console.log(authToken);

    success=true;
    res.json({success, authToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({success, error: 'Failed to create a user' });
  }
});


//ROUTE 2:
// Authenticate a user using POST (/api/auth/login)
router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').exists().withMessage('Password cannot be blank')
], async (req, res) => {
  let success=false;
  console.log(req.body);

  // If there are errors, return bad request and errors.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    //Destructuring:
    const { email, password } = req.body;


    //finding the email from the database 
    let user = await User.findOne({ email });
    if (!user) {
      success=false;
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }


    //matching the db email with entered email
    const passwordCompare = bcrypt.compareSync(password, user.password);

    // const passwordCompare = async(password) => {
    //     const match = await bcrypt.compare(password, user.password);
    //     return match;
    // }


    if (!passwordCompare) {
      success=false;
      return res.status(400).json({success, error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    };

    const authToken = jwt.sign(data, JWT_SECRET);
    success=true;
    res.json({success, authToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//ROUTE 3:
//Get loggedIn user Details using POST api (/api/auth/getuser). Login requires


router.post('/getuser', fetchuser, async (req, res) => {
  console.log(req.body);

try{
  const userId=req.user.id;
  const user=await User.findById(userId).select("-password");
  res.send(user);
}

catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
}

});


module.exports = router;

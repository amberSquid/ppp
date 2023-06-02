import express from 'express';
import bcrypt from 'bcrypt';

import db from '../index.js'

const userRouter = express.Router();

userRouter.get('/', (req, res) => {

    res.status(200).send({"msg": "Hello"})

})


userRouter.post('/register', (req, res) => {
    const { firstname, lastname, nationality, dob, gender, password, email } = req.body;
  
    // Check if the email already exists in the logins table
    const emailCheckQuery = 'SELECT * FROM logins WHERE email = ?';
    db.query(emailCheckQuery, [email], (emailCheckErr, emailCheckResult) => {
      if (emailCheckErr) {
        console.error('Error checking email:', emailCheckErr);
        return res.status(500).json({ error: emailCheckErr });
      }
  
      if (emailCheckResult.length > 0) {
        // Email already exists
        return res.status(409).json({ error: 'Email already exists' });
      }
  
      // Insert user data into the users table
      const userQuery = 'INSERT INTO users (firstname, lastname, nationality, dob, gender) VALUES (?, ?, ?, ?, ?)';
      db.query(userQuery, [firstname, lastname, nationality, dob, gender], (userErr, userResult) => {
        if (userErr) {
          console.error('Error inserting user data:', userErr);
          return res.status(500).json({ error: userErr });
        }
  
        const userId = userResult.insertId;
  
        // Encrypt the password using bcrypt
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ error: err });
          }
  
          // Insert user login data into the logins table
          const loginQuery = 'INSERT INTO logins (email, password, user_id) VALUES (?, ?, ?)';
          db.query(loginQuery, [email, hashedPassword, userId], (loginErr, loginResult) => {
            if (loginErr) {
              console.error('Error inserting login data:', loginErr);
              return res.status(500).json({ login: loginErr });
            }
  
            // Return the userId
            res.status(200).json({ userId });
          });
        });
      });
    });
  });

  
  userRouter.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Check if the email exists in the logins table
    const emailCheckQuery = 'SELECT * FROM logins WHERE email = ?';
    db.query(emailCheckQuery, [email], (emailCheckErr, emailCheckResult) => {
      if (emailCheckErr) {
        console.error('Error checking email:', emailCheckErr);
        return res.status(500).json({ error: emailCheckErr });
      }
  
      if (emailCheckResult.length === 0) {
        // Email does not exist
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const loginData = emailCheckResult[0];
  
      // Compare the provided password with the stored hashed password
      bcrypt.compare(password, loginData.password, (err, passwordMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).json({ error: err });
        }
  
        if (!passwordMatch) {
          // Password does not match
          return res.status(401).json({ error: 'Invalid credentials' });
        }
  
        // Get the user data from the users table
        const userQuery = 'SELECT * FROM users WHERE id = ?';
        db.query(userQuery, [loginData.user_id], (userErr, userResult) => {
          if (userErr) {
            console.error('Error retrieving user data:', userErr);
            return res.status(500).json({ error: userErr });
          }
  
          if (userResult.length === 0) {
            // User data not found
            return res.status(500).json({ error: 'User data not found' });
          }
  
          const userData = userResult[0];
          const { id, firstname, lastname, nationality, dob, gender } = userData;
  
          // Return the user data without the password
          res.status(200).json({
            id,
            firstname,
            lastname,
            nationality,
            dob,
            gender,
            email
          });
        });
      });
    });
  });
  


export default userRouter;
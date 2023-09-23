const express = require("express");
const router = express.Router();
const crypto = require('node:crypto');
const db = require('../../utils/database');
const bcrypt = require('bcrypt');

router
  .route("/")
  .get((req, res) => {
    res.status(200).json({ message: "success" });
  })
  .post( async (req, res) => {
    const { first_name, last_name, email, password, rank, phone_number } =  req.body;
    const id = crypto.randomUUID().split('-')[4]
    const hashedPassword = await bcrypt.hash(password, 13)
    
    const credentials = [
        id,
        first_name,
        last_name,
        email,
        hashedPassword,
        rank,
        phone_number
    ]
    
    const sql = `INSERT INTO officer (id, first_name, last_name, email, password, ranks, phone_number) 
    values (?, ?, ?, ?, ?, ?, ?)`;
    try{

        db.query(sql, credentials, ( err, rows ) => {
            if(err) return res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${err}`
            })
            return res.status(200).json({
                status: 200,
                message: 'Successfully created',
                data: rows
            })
        })
    }catch(error){
        console.log(`Server error controller/officer/post: ${error}`);
    }
    
    
  });

    


module.exports = router;
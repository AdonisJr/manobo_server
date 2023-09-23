const express = require('express');
const router = express.Router();
const db = require('../../utils/database');
const bcrypt = require('bcrypt');
const JWT = require('../../middleware/JWT');

router.route('/')
    .get( async( req, res ) => {
        
        res.status(200).json('access')
    })
    .post( ( req, res ) => {
        const { email, password } = req.body;
        const sql = 'SELECT * FROM officer where email = ?'
        db.query(sql, email, async( err, rows ) => {
            if(err) return res.status(500).json({
                status: 500,
                message: 'Server Error, Please try again'
            })

            if(rows.length === 0) return res.status(200).json({status: 200, message: 'Email not found'})
            
            const isPasswordValid = await bcrypt.compare(password, rows[0].password)
            
            if(!isPasswordValid) return res.status(200).json({
                status: 200,
                message: "Password not match"
            })
            if(rows[0].role !== 'admin') return res.status(200).json({message: 'error'})
            

            const result = {
                id: rows[0].id,
                first_name:  rows[0].first_name,
                last_name: rows[0].last_name,
                email:  rows[0].email,
                ranks:  rows[0].ranks,
                phone_number: rows[0].phone_number,
            }
            
            const accessToken = await JWT.getAccessToken(result)

            return res.status(200).json(accessToken)
        })
    })


module.exports = router;
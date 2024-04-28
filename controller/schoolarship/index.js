const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const db = require("../../utils/database");
const bcrypt = require("bcrypt");
const JWT = require("../../middleware/JWT");

// GET ALL AND INSERT Assistance

router
    .route("/")
    .get(JWT.verifyAccessToken, (req, res) => {
        try {
            const sql = "SELECT * FROM user_schoolarship";


            db.query(sql, role, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/user/get: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }

                if (rows.length === 0) return res.status(200).json({
                    error: "200",
                    message: "No Record found"
                })

                return res.status(200).json({
                    status: 200,
                    message: `Successfully retrieved ${rows.length} record/s`,
                    data: rows,
                });
            });
        } catch (error) {
            console.log(`Server error controller/user/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .post(JWT.verifyAccessToken, async (req, res) => {
        const { user_id } =
            req.body;
        const id = crypto.randomUUID().split("-")[4];


        const sql = `INSERT INTO user_schoolarship (id, user_id) 
    values (?, ?)`;
        try {
            db.query(sql, [id, user_id], (err, rows) => {
                if (err) {
                    console.log(`Server error controller/user/post: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }
                return res.status(200).json({
                    status: 200,
                    message: "Successfully created",
                    data: rows,
                });
            });
        } catch (error) {
            console.log(`Server error controller/user/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });

// UPDATE AND DELETE API

router
    .route("/")
    .put(JWT.verifyAccessToken, async (req, res) => {
        const { first_name, middle_name, last_name, phone_number, role, password, gender, suffix } = req.body;
        const id = req.query.id;
        let hashedPassword = "";
        let credentials = [];
        try {
            let sql = "";
            if (!password || password === null) {
                sql = `UPDATE user SET first_name = ?, middle_name = ?, last_name = ?, gender = ?, phone_number = ?, role = ?, suffix = ?
                WHERE id = ?`;
                credentials = [
                    first_name,
                    middle_name,
                    last_name,
                    gender,
                    phone_number,
                    role,
                    suffix,
                    id,
                ];
            } else {
                sql = `UPDATE user SET first_name = ?, middle_name = ?, last_name = ?, gender = ?, phone_number = ?, role = ?, password = ?, suffix = ?
                WHERE id = ?`;
                hashedPassword = await bcrypt.hash(password, 13);
                credentials = [
                    first_name,
                    middle_name,
                    last_name,
                    gender,
                    phone_number,
                    role,
                    hashedPassword,
                    suffix,
                    id,
                ];
            }
            console.log(credentials)
            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/user/put: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }

                return res.status(200).json({
                    status: 200,
                    message: "Successfully updated",
                    data: rows,
                });
            });
        } catch (error) {
            console.log(`Server error controller/user/put: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .delete(JWT.verifyAccessToken, (req, res) => {
        const id = req.query.id;
        try {
            const sql = 'DELETE FROM user WHERE id = ?';
            db.query(sql, id, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/user/delete: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }
                return res.status(200).json({
                    status: 200,
                    message: 'Successfully Deleted',
                    data: rows
                })
            })
        } catch (error) {
            console.log(`Server error controller/user/delete: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });

router.get("/:id", JWT.verifyAccessToken, (req, res) => {
    const id = req.params.id;
    try {
        sql = "SELECT * FROM user_schoolarship WHERE user_id = ?";

        db.query(sql, id, (err, rows) => {
            if (err) {
                console.log(`Server error controller/schoolarship/get: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }

            return res.status(200).json({
                status: 200,
                message: `Successfully retrieved ${rows.length} record/s`,
                data: rows,
            });
        });
    } catch (error) {
        console.log(`Server error controller/schoolarship/post: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

module.exports = router;
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
        const user_id = req.query.user_id || null;
        try {
            const sql = `SELECT 
            r.id AS rel_id, r.*, u.*, o.*
            FROM relationship r 
            INNER JOIN user u ON r.relationship_id = u.id 
            LEFT JOIN other_info o ON o.user_id = u.id 
            WHERE r.user_id = ?`;


            db.query(sql, user_id, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/relationship/get: ${err}`);
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
            console.log(`Server error controller/relationship/get: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .post(async (req, res) => {
        const { user_id, relationship_id, relationship } =
            req.body;

        const sql = `INSERT INTO relationship (user_id, relationship_id, relationship) 
    values (?, ?, ?)`;
        try {
            db.query(sql, [user_id, relationship_id, relationship], (err, rows) => {
                if (err) {
                    console.log(`Server error controller/relationsip/post: ${err}`);
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
            console.log(`Server error controller/relationsip/post: ${error}`);
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
        const { user_id, relationship_id, relationship } = req.body;
        const id = req.query.id;
        let hashedPassword = "";
        let credentials = [
            user_id,
            relationship_id,
            relationship,
            id
        ];
        try {
            let sql = "";
            sql = `UPDATE user SET user_id = ?, relationship_id = ?, relationship = ? WHERE id = ?`;
            credentials = [
                user_id,
                relationship_id,
                relationship,
                id,
            ];

            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/relationship/put: ${err}`);
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
            console.log(`Server error controller/relationship/put: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .delete(JWT.verifyAccessToken, (req, res) => {
        const id = req.query.id;
        try {
            const sql = 'DELETE FROM relationship WHERE id = ?';
            db.query(sql, id, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/relationship/delete: ${err}`);
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
            console.log(`Server error controller/relationship/delete: ${error}`);
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
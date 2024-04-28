const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const db = require("../../utils/database");
const bcrypt = require("bcrypt");
const JWT = require("../../middleware/JWT");
const UPLOAD = require("../../middleware/upload");
const fs = require("fs");

// GET ALL AND INSERT OFFICER

router
    .route("/")
    .get((req, res) => {
        try {
            let sql = "SELECT * FROM announcement ORDER BY created_at DESC";
            const params = [];

            db.query(sql, params, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/user/get: ${err}`);
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
            console.log(`Server error controller/user/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .post(UPLOAD.fileUploadMiddleware, async (req, res) => {
        const { user_id, title, content, footer } = req.body;
        const url = req.url;
        const id = crypto.randomUUID().split("-")[4];

        const params = [
            id,
            user_id,
            title,
            content,
            footer,
            url
        ];

        const sql = `INSERT INTO announcement (id, user_id, title, content, footer, url) 
    values (?, ?, ?, ?, ?, ?)`;
        try {
            db.query(sql, params, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/announcement/post: ${err}`);
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
            console.log(`Server error controller/announcement/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });

// UPDATE AND DELETE API

router
    .route("/")
    .put(JWT.verifyAccessToken, UPLOAD.fileUploadMiddleware, async (req, res) => {
        const { id, title, content, footer } = req.query;
        const url = req.url;

        const params = [
            title,
            content,
            footer
        ];

        try {

            let sql = "";
            if (url === "") {
                sql = `UPDATE announcement SET title = ?, content = ?, footer = ?
                WHERE id = ?`;
                params.push(id)
            } else {
                sql = `UPDATE announcement SET title = ?, content = ?, footer = ?, url = ?
                WHERE id = ?`;
                params.push(url, id)
            }

            db.query(sql, params, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/announcement/put: ${err}`);
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
            console.log(`Server error controller/announcement/put: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .delete(JWT.verifyAccessToken, (req, res) => {
        const url = req.query.url;
        const id = req.query.id;
        try {
            const sql = 'DELETE FROM announcement WHERE id = ?';
            db.query(sql, id, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/announcement/delete: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        error: `Internal Server Error, ${err}`,
                    });
                }
                if (url !== "") {
                    fs.unlinkSync(url);
                }
                return res.status(200).json({
                    status: 200,
                    message: 'Successfully Deleted',
                    data: rows
                })
            })
        } catch (error) {
            console.log(`Server error controller/announcement/delete: ${error}`);
            res.status(500).json({
                status: 500,
                error: `Internal Server Error, ${error}`,
            });
        }
    });

router.put('/changepassword', async (req, res) => {
    const { password, cpassword } = req.body
    const id = req.query.id;
    let hashedPassword = "";
    try {
        const sql = `UPDATE user SET password = ? WHERE id = ?`;


        hashedPassword = await bcrypt.hash(password, 13);
        db.query(sql, [hashedPassword, id], (err, rows) => {
            if (err) {
                console.log(`Server error controller/user/changepassword/put: ${err}`);
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
        console.log(`Server error controller/user/changepassword/put: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})


router.get("/all", (req, res) => {
    const page = parseInt(req.query.page) || 1; // default page is 1
    const limit = parseInt(req.query.limit) || 5; // default limit is 10
    const isIndex = req.query.isIndex;
    const q = req.query.q || null;
    const offense = req.query.offense || 'CLEAR';
    const barangay = req.query.barangay || 'CLEAR';
    const year = req.query.year || 'CLEAR';
    try {
        const offset = (page - 1) * limit;
        // sql = "SELECT barangay, COUNT(*) as total_cases FROM crime_reported WHERE validated = 1 GROUP BY barangay ORDER BY total_cases DESC";
        let sql = ""
        sql = "SELECT COUNT(*) as totalCount FROM announcement";

        const params1 = [];


        db.query(sql, params1, (err, countResult) => {
            if (err) {
                console.log(`Server error controller/announcement/get: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }

            const totalCount = countResult[0].totalCount

            const params2 = [];

            sql = `SELECT * FROM announcement`


            sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
            params2.push(limit, offset);

            db.query(sql, params2, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/farm/list/get data: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }

                // return res.status(200).json({
                //     status: 200,
                //     message: `Successfully retrieved ${rows.length} record/s`,
                //     data: rows,
                //     totalCount: totalCount // Include total count in the response
                // });
                return res.status(200).json({
                    status: 200,
                    message: `Successfully retrieved ${rows.length} record/s`,
                    data: rows,
                    totalCount: totalCount
                });
            })


        });
    } catch (error) {
        console.log(`Server error controller/announcement/get: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

router.get("/:id", JWT.verifyAccessToken, (req, res) => {
    const id = req.params.id;
    try {
        sql = "SELECT * FROM user WHERE id = ?";

        db.query(sql, id, (err, rows) => {
            if (err) {
                console.log(`Server error controller/user/get: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }

            if (rows.length === 0) return res.status(401).json({
                error: "401",
                message: "No Record found"
            })


            const result = {
                id: rows[0].id,
                first_name: rows[0].first_name,
                middle_name: rows[0].middle_name,
                last_name: rows[0].last_name,
                gender: rows[0].gender,
                email: rows[0].email,
                ranks: rows[0].ranks,
                suffix: rows[0].suffix,
                phone_number: rows[0].phone_number,
                role: rows[0].role,
                birth_date: rows[0].birth_date,
                address: rows[0].address
            }

            return res.status(200).json({
                status: 200,
                message: `Successfully retrieved ${rows.length} record/s`,
                data: result,
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



module.exports = router;
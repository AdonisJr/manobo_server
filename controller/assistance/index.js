const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const db = require("../../utils/database");
const bcrypt = require("bcrypt");
const JWT = require("../../middleware/JWT");

// GET ALL AND INSERT ASSISTANCE

router
    .route("/")
    .get(JWT.verifyAccessToken, (req, res) => {
        try {
            const sql = "SELECT * FROM assistance";


            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/assistance/get: ${err}`);
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
            console.log(`Server error controller/assistance/get: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .post(JWT.verifyAccessToken, async (req, res) => {
        const { user_id, type } =
            req.body;
        const id = crypto.randomUUID().split("-")[4];


        const sql = `INSERT INTO assistance (id, user_id, type) 
    values (?, ?, ?)`;
        try {
            db.query(sql, [id, user_id, type], (err, rows) => {
                if (err) {
                    console.log(`Server error controller/medical/post: ${err}`);
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
            console.log(`Server error controller/medical/post: ${error}`);
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
        const { id, application_letter, grades, family_tree, medical_abstract, death_certificate, indigency, valid_id, remarks, status } = req.body;
        
        try {
            let sql = "";
            sql = `UPDATE assistance SET application_letter = ?, grades = ?, family_tree = ?, medical_abstract = ?,
                    death_certificate = ?, indigency = ?, valid_id = ?, remarks = ?, status = ?
                WHERE id = ?`;
            const params = [
                application_letter,
                grades,
                family_tree,
                medical_abstract,
                death_certificate,
                indigency,
                valid_id,
                remarks,
                status,
                id,
            ];

            db.query(sql, params, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/assistance/put: ${err}`);
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
            console.log(`Server error controller/assistance/put: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .delete(JWT.verifyAccessToken, (req, res) => {
        const id = req.query.id;
        console.log(id)
        try {
            const sql = 'DELETE FROM assistance WHERE id = ?';
            db.query(sql, id, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/assistance/delete: ${err}`);
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
            console.log(`Server error controller/assistance/delete: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });


router.get("/all", (req, res) => {
    const page = parseInt(req.query.page) || 1; // default page is 1
    const limit = parseInt(req.query.limit) || 5; // default limit is 10
    const isIndex = req.query.isIndex;
    const q = req.query.q || null;
    const type = req.query.type;

    try {
        const offset = (page - 1) * limit;
        // sql = "SELECT barangay, COUNT(*) as total_cases FROM crime_reported WHERE validated = 1 GROUP BY barangay ORDER BY total_cases DESC";
        let sql = ""
        sql = "SELECT COUNT(*) as totalCount FROM assistance WHERE type = ?";

        const params1 = [type];


        db.query(sql, params1, (err, countResult) => {
            if (err) {
                console.log(`Server error controller/assistance/get: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }

            const totalCount = countResult[0].totalCount

            const params2 = [type];

            sql = `SELECT assistance.*, user.first_name, user.middle_name, 
            user.last_name, user.suffix FROM assistance INNER JOIN user on 
            user.id = assistance.user_id WHERE type = ?`


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
    const { type } = req.query;
    try {
        sql = "SELECT * FROM assistance WHERE user_id = ? AND type = ?";

        db.query(sql, [id, type], (err, rows) => {
            if (err) {
                console.log(`Server error controller/assistance/get: ${err}`);
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
        console.log(`Server error controller/assistance/post: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

module.exports = router;
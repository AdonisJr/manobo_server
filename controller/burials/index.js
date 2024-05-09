const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const db = require("../../utils/database");
const bcrypt = require("bcrypt");
const JWT = require("../../middleware/JWT");
const multer = require('multer');
const mimeTypes = require("mime-types");
const path = require('path');
const fs = require("fs");

function getFileExtension(filename) {
    return filename.split('.').pop();
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // specify the directory where you want to save the files
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
});


// GET ALL AND INSERT ASSISTANCE

router
    .route("/")
    .get(JWT.verifyAccessToken, (req, res) => {
        try {
            const sql = "SELECT * FROM burial ORDER BY created_at DESC";

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/burial/get: ${err}`);
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
            console.log(`Server error controller/burial/get: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .post(upload.array('files', 4), async (req, res) => {
        const user_id = req.body.id;
        console.log(user_id)
        const id = crypto.randomUUID().split("-")[4];
        const filePath = req.file?.path || null;
        const credentials = [id, user_id];

        let sql = ""


        if (req.files) {
            sql = `INSERT INTO burial (id, user_id, application_letter, application_extension, death_certificate, death_extension, indigency, indigency_extension, valid_id, valid_extension) 
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        } else {
            return res.status(500).json({
                status: 500,
                message: `Please upload files/image`,
            });
        }

        if (req.files) {
            req.files.forEach(file => {
                const filePath = file.path;
                const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
                // Extracting the file extension
                const extension = getFileExtension(file.originalname);
                credentials.push(imageBase64, extension);
                // Optionally, you can delete the uploaded file after reading it
                fs.unlinkSync(filePath);
            });
        }


        try {
            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/burial/post: ${err}`);
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
            console.log(`Server error controller/burial/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });

// UPDATE AND DELETE API

router
    .route("/")
    .put(JWT.verifyAccessToken, upload.single('files'), async (req, res) => {
        const { id, remarks, status, family_tree } = req.body;
        try {
            let sql = "";
            sql = `UPDATE burial SET family_tree = ?, remarks = ?, status = ?
                WHERE id = ?`;
            const params = [
                family_tree,
                remarks,
                status,
                id,
            ];

            db.query(sql, params, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/burial/put: ${err}`);
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
            console.log(`Server error controller/burial/put: ${error}`);
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
            const sql = 'DELETE FROM burial WHERE id = ?';
            db.query(sql, id, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/burial/delete: ${err}`);
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
            console.log(`Server error controller/burial/delete: ${error}`);
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

    try {
        const offset = (page - 1) * limit;
        // sql = "SELECT barangay, COUNT(*) as total_cases FROM crime_reported WHERE validated = 1 GROUP BY barangay ORDER BY total_cases DESC";
        let sql = ""
        sql = "SELECT COUNT(*) as totalCount FROM burial";

        const params1 = [];


        db.query(sql, params1, (err, countResult) => {
            if (err) {
                console.log(`Server error controller/burial/get: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }

            const totalCount = countResult[0].totalCount

            const params2 = [];

            sql = `SELECT burial.*, user.first_name, user.middle_name, 
                user.last_name, user.suffix FROM burial INNER JOIN user on 
                user.id = burial.user_id`


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
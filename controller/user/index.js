const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const db = require("../../utils/database");
const bcrypt = require("bcrypt");
const JWT = require("../../middleware/JWT");

// GET ALL AND INSERT OFFICER

const findEmail = (req, res, next) => {
    const { email } = req.body;
    console.log(req.body)
    try {
        let sql = "SELECt * FROM user WHERE email = ?";
        db.query(sql, email, (err, rows) => {
            if (err) {
                console.log(`Server error controller/findEmail: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }
            if (rows.length !== 0) return res.status(401).json({
                status: 401,
                message: `Email already exist.`,
                error: `Duplicate.`
            });
            next();
        })
    } catch (error) {
        console.log(`Server error controller/findEmail/ ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
}

router
    .route("/")
    .get(JWT.verifyAccessToken, (req, res) => {
        const role = req.query.role || "";
        const q = req.query.q || "";
        try {
            let sql = "";
            const params = [role]
            if (role) {
                sql = `SELECT user.id, user.first_name, user.middle_name, user.last_name, user.email, user.gender, user.phone_number, user.barangay, user.role, 
                other_info.special_skills, other_info.user_id 
                FROM user 
                        LEFT JOIN other_info ON other_info.user_id = user.id
                    WHERE role = ?`;
                if(q){
                    sql +=" AND special_skills LIKE ?"
                    params.push(`%${q}%`)
                }
            } else {
                sql = "SELECT * FROM user";
            }

            console.log(sql)

            db.query(sql, params, (err, rows) => {
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
    .post(findEmail, async (req, res) => {
        const { first_name, middle_name, last_name, email, gender, password, phone_number, role, barangay } =
            req.body;
        const id = crypto.randomUUID().split("-")[4];
        const hashedPassword = await bcrypt.hash(password, 13);

        const credentials = [
            id,
            first_name,
            middle_name,
            last_name,
            email,
            gender,
            hashedPassword,
            phone_number,
            role,
            barangay
        ];

        const sql = `INSERT INTO user (id, first_name, middle_name, last_name, email, gender, password, phone_number, role, barangay) 
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        try {
            db.query(sql, credentials, (err, rows) => {
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
        const { first_name, middle_name, last_name, phone_number, role, password, gender, suffix, barangay } = req.body;
        const id = req.query.id;
        let hashedPassword = "";
        let credentials = [];
        try {
            let sql = "";
            if (!password || password === null) {
                sql = `UPDATE user SET first_name = ?, middle_name = ?, last_name = ?, gender = ?, phone_number = ?, role = ?, suffix = ?, barangay = ?
                WHERE id = ?`;
                credentials = [
                    first_name,
                    middle_name,
                    last_name,
                    gender,
                    phone_number,
                    role,
                    suffix,
                    barangay,
                    id,
                ];
            } else {
                sql = `UPDATE user SET first_name = ?, middle_name = ?, last_name = ?, gender = ?, phone_number = ?, role = ?, password = ?, suffix = ?, barangay = ?
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
                    barangay,
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

router.get('/all', (req, res) => {
    const { id, middle_name, last_name } = req.query;

    try {
        const params = [id, middle_name, middle_name, last_name, last_name];
        let sql = ""
        sql = `SELECT id, first_name, middle_name, last_name, email, gender, phone_number, role 
        FROM user WHERE id != ? AND (middle_name = ? OR last_name = ? OR middle_name = ? OR last_name = ?)`;


        db.query(sql, params, (err, rows) => {
            if (err) {
                console.log(`Server error controller/user/all/get: ${err}`);
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
        console.log(`Server error controller/user/all/get: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

router.get('/stat', (req, res) => {
    const { id, middle_name, last_name } = req.query;

    try {
        const params = [id, middle_name, middle_name, last_name, last_name];
        let sql = ""
        sql = `SELECT user.first_name, user.middle_name, user.last_name,
                user.suffix, user.email, user.role, user.gender, user.phone_number,
        other_info.* FROM user INNER JOIN other_info ON user.id = other_info.user_id WHERE role = 'member'`;

        db.query(sql, params, (err, rows) => {
            if (err) {
                console.log(`Server error controller/user/all/get: ${err}`);
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
        console.log(`Server error controller/user/all/get: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

router.get('/ageBracket', (req, res) => {

    try {
        const params = [];
        let sql = ""
        sql = `SELECT 
        CASE 
            WHEN age <= 14 THEN '0-14'
            WHEN age BETWEEN 15 AND 59 THEN '15-59'
            ELSE '60+'
        END AS age_bracket,
        COUNT(*) AS user_count
    FROM 
        user 
    INNER JOIN 
        other_info ON user.id = other_info.user_id 
    WHERE 
        role = 'member'
    GROUP BY 
        CASE 
            WHEN age <= 14 THEN '0-14'
            WHEN age BETWEEN 15 AND 59 THEN '15-59'
            ELSE '60+'
        END ORDER BY age_bracket`;

        db.query(sql, params, (err, rows) => {
            if (err) {
                console.log(`Server error controller/user/all/get: ${err}`);
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
        console.log(`Server error controller/user/all/get: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})


router.get('/census', (req, res) => {
    const year = req.query.year || ""
    try {
        const params = [year];
        let sql = ""
        sql = `SELECT YEAR(u.created_at) AS year,
        COUNT(*) AS total_members,
        u.barangay,
        SUM(CASE WHEN u.gender = 'male' THEN 1 ELSE 0 END) AS total_male_members,
        SUM(CASE WHEN u.gender = 'female' THEN 1 ELSE 0 END) AS total_female_members,
        SUM(CASE WHEN oi.marital_status1 = 'Married' THEN 1 ELSE 0 END) AS total_married_members
    FROM user u INNER JOIN other_info oi ON u.id = oi.user_id`;
    if(year){
        sql += ` WHERE u.role = 'member' AND YEAR(u.created_at) = ?`
        params.push(year)
    }else{
        sql += ` WHERE u.role = 'member'`
    }
    sql+=` GROUP BY u.barangay, YEAR(u.created_at)`
    // console.log(sql)

        db.query(sql, params, (err, rows) => {
            if (err) {
                console.log(`Server error controller/user/census/get: ${err}`);
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
        console.log(`Server error controller/user/census/get: ${error}`);
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
                barangay: rows[0].barangay,
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
const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const db = require("../../utils/database");
const bcrypt = require("bcrypt");
const JWT = require("../../middleware/JWT");

// GET ALL AND INSERT OFFICER

const findId = (req, res, next) => {
    const { user_id } = req.body;
    try {
        let sql = "SELECt * FROM other_info WHERE user_id = ?";
        db.query(sql, user_id, (err, rows) => {
            if (err) {
                console.log(`Server error controller/findEmail: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }
            if (rows.length !== 0) {
                req.update = true
                next();
            }
            req.update = false
            next();
            // if (rows.length !== 0) return res.status(401).json({
            //     status: 401,
            //     message: `Email already exist.`,
            //     error: `Duplicate.`
            // });
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
        try {
            let sql = "";
            if (role) {
                sql = "SELECT id, first_name, middle_name, last_name, email, gender, phone_number, role FROM user WHERE role = ?";
            } else {
                sql = "SELECT * FROM user";
            }

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
    .post(findId, JWT.verifyAccessToken, async (req, res) => {
        const { user_id, birth_date, age, tribe, birth_place, birth_registration, birth_copy, marital_status1, marital_status2, marital_status3, religion, philhealth, fourps, senior_citizen, pensioner, benificiary, school_attendance1, school_name1, school_address1, literacy, dialect, highest_grade, year_completed, school_name2, school_address2, vocational_course, vocational_specify, school_name3, school_address3, special_skills, occupation } =
            req.body;
        const id = crypto.randomUUID().split("-")[4];

        const credentials = [
            id,
            user_id,
            birth_date,
            age,
            tribe,
            birth_place,
            birth_registration,
            birth_copy,
            marital_status1,
            marital_status2,
            marital_status3,
            religion,
            philhealth,
            fourps,
            senior_citizen,
            pensioner,
            benificiary,
            school_attendance1,
            school_name1,
            school_address1,
            literacy,
            dialect,
            highest_grade,
            year_completed,
            school_name2,
            school_address2,
            vocational_course,
            vocational_specify,
            school_name3,
            school_address3,
            special_skills,
            occupation
        ]
        const sql = `INSERT INTO other_info (id, user_id, birth_date, age, 
                tribe, birth_place, birth_registration, birth_copy, marital_status1, 
                marital_status2, marital_status3, religion, philhealth, 
                fourps, senior_citizen, pensioner, benificiary, 
                school_attendance1, school_name1, school_address1, literacy, 
                dialect, highest_grade, year_completed, school_name2, 
                school_address2, vocational_course, vocational_specify, 
                school_name3, school_address3, special_skills, occupation) 
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        try {
            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/otherInfo/post: ${err}`);
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
            console.log(`Server error controller/otherInfo/post: ${error}`);
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
        const { user_id, birth_date, age, tribe, birth_place, birth_registration, birth_copy, marital_status1, marital_status2, marital_status3, religion, philhealth, fourps, senior_citizen, pensioner, benificiary, school_attendance1, school_name1, school_address1, literacy, dialect, highest_grade, year_completed, school_name2, school_address2, vocational_course, vocational_specify, school_name3, school_address3, special_skills, occupation } =
            req.body;
        const credentials = [
            birth_date,
            age,
            tribe,
            birth_place,
            birth_registration,
            birth_copy,
            marital_status1,
            marital_status2,
            marital_status3,
            religion,
            philhealth,
            fourps,
            senior_citizen,
            pensioner,
            benificiary,
            school_attendance1,
            school_name1,
            school_address1,
            literacy,
            dialect,
            highest_grade,
            year_completed,
            school_name2,
            school_address2,
            vocational_course,
            vocational_specify,
            school_name3,
            school_address3,
            special_skills,
            occupation,
            user_id
        ]

        const sql = `UPDATE other_info SET birth_date = ?, age = ?, tribe = ?, birth_place = ?,
                    birth_registration = ?, birth_copy = ?, marital_status1 = ?,
                    marital_status2 = ?, marital_status3 = ?, religion = ?, philhealth = ?,
                    fourps = ?, senior_citizen = ?, pensioner = ?, benificiary = ?, 
                    school_attendance1 = ?, school_name1 = ?, school_address1 = ?, 
                    literacy = ?, dialect = ?, highest_grade = ?, year_completed = ?, 
                    school_name2 = ?, school_address2 = ?, vocational_course = ?,
                    vocational_specify = ?, school_name3 = ?, school_address3 = ?, 
                    special_skills = ?, occupation = ? WHERE user_id = ?`
        try {
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

// router.get("/:id", JWT.verifyAccessToken, (req, res) => {
//     const id = req.params.id;

//     console.log(id)
//     try {
//         sql = "SELECT * FROM user WHERE id = ?";

//         db.query(sql, id, (err, rows) => {
//             if (err) {
//                 console.log(`Server error controller/user/get: ${err}`);
//                 return res.status(500).json({
//                     status: 500,
//                     message: `Internal Server Error, ${err}`,
//                 });
//             }

//             if (rows.length === 0) return res.status(401).json({
//                 error: "401",
//                 message: "No Record found"
//             })


//             const result = {
//                 id: rows[0].id,
//                 first_name: rows[0].first_name,
//                 middle_name: rows[0].middle_name,
//                 last_name: rows[0].last_name,
//                 email: rows[0].email,
//                 ranks: rows[0].ranks,
//                 phone_number: rows[0].phone_number,
//                 role: rows[0].role,
//                 birth_date: rows[0].birth_date,
//                 address: rows[0].address
//             }

//             return res.status(200).json({
//                 status: 200,
//                 message: `Successfully retrieved ${rows.length} record/s`,
//                 data: result,
//             });
//         });
//     } catch (error) {
//         console.log(`Server error controller/user/post: ${error}`);
//         res.status(500).json({
//             status: 500,
//             message: `Internal Server Error, ${error}`,
//         });
//     }
// })
router.get('/:id', (req, res) => {

    let user_id = req.params.id;
    const sql = "SELECT * FROM other_info WHERE user_id = ?";
    try {
        db.query(sql, user_id, (err, rows) => {
            if (err) {
                console.log(`Server error controller/otherInfo/get: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }
            if (rows.length === 0) return res.status(404).json({
                error: "404",
                message: "No Record found"
            })
            return res.status(200).json({
                status: 200,
                message: `Successfully retrieved ${rows.length} record/s`,
                data: rows,
            });
        });
    } catch (error) {
        console.log(`Server error controller/otherInfo/post: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../../utils/database");
const JWT = require("../../middleware/JWT");

router
  .route("/")
  .get( JWT.verifyAccessToken, (req, res) => {
    let filter = req.query.filter || "";
    let keywords = req.query.keywords || "";

    const credentials = [
      filter,
      '%'+keywords+'%',
      filter,
      '%'+keywords+'%'
    ]
    
    try {
      let sql = "";
        sql = "SELECT * FROM person_of_concern WHERE type = ? AND first_name LIKE ? OR type = ? AND last_name LIKE ?";
      

      db.query(sql, credentials, (err, rows) => {
        if (err) {
          console.log(`Server error controller/officer/get: ${err}`);
          return res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${err}`,
          });
        }
        console.log(rows)
        return res.status(200).json({
          status: 200,
          message: `Successfully retrieved ${rows.length} record/s`,
          data: rows,
        });
      });
    } catch (error) {
      console.log(`Server error controller/officer/post: ${error}`);
      res.status(500).json({
        status: 500,
        message: `Internal Server Error, ${error}`,
      });
    }
  })
  .post(JWT.verifyAccessToken, async (req, res) => {
    const {
      first_name,
      middle_name,
      last_name,
      gender,
      last_known_address,
      type,
      crime_committed,
    } = req.body;
    const id = crypto.randomUUID().split("-")[4];

    const credentials = [
      id,
      first_name,
      middle_name,
      last_name,
      gender,
      last_known_address,
      type,
      crime_committed,
    ];

    const sql = `INSERT INTO officer (id, first_name, middle_name, last_name, gender, last_known_address, type, crime_committed) 
    values (?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
      db.query(sql, credentials, (err, rows) => {
        if (err) {
          console.log(`Server error controller/personOfConcern/post: ${err}`);
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
      console.log(`Server error controller/personOfConcern/post: ${error}`);
      res.status(500).json({
        status: 500,
        message: `Internal Server Error, ${error}`,
      });
    }
  });

// UPDATE AND DELETE API

router
  .route("/:id")
  .put( JWT.verifyAccessToken, async (req, res) => {
    const {
        first_name,
        middle_name,
        last_name,
        gender,
        last_known_address,
        type,
        crime_committed,
      } = req.body;
    const id = req.params.id;
    try {
      const sql = `UPDATE person_of_concern SET first_name = ?, middle_name = ?, last_name = ?, gender = ?, last_known_address = ?, type = ?, crime_committed = ?
     WHERE id = ?
    `;
      const credentials = [
        first_name,
        middle_name,
        last_name,
        gender,
        last_known_address,
        type,
        crime_committed,
        id,
      ];

      db.query(sql, credentials, (err, rows) => {
        if (err) {
          console.log(`Server error controller/personOfConcern/put: ${err}`);
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
      console.log(`Server error controller/personOfConcern/put: ${error}`);
      res.status(500).json({
        status: 500,
        message: `Internal Server Error, ${error}`,
      });
    }
  })
  .delete( JWT.verifyAccessToken, (req, res) => {
    const id = req.params.id;
    try {
      const sql = "DELETE FROM person_of_concern WHERE id = ?";
      db.query(sql, id, (err, rows) => {
        if (err) {
          console.log(`Server error controller/personOfConcern/delete: ${err}`);
          return res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${err}`,
          });
        }
        return res.status(200).json({
          status: 200,
          message: "Successfully Deleted",
          data: rows,
        });
      });
    } catch (error) {
      console.log(`Server error controller/personOfConcern/delete: ${error}`);
      res.status(500).json({
        status: 500,
        message: `Internal Server Error, ${error}`,
      });
    }
  });

module.exports = router;

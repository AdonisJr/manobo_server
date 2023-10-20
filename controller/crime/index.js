const express = require("express");
const router = express.Router();
const db = require("../../utils/database");
const crypto = require("node:crypto");

router
  .route("/")
  .get((req, res) => {
    const id = req.query.id || "";
    // const currentDate = new Date();
    // const formattedDate = currentDate.toISOString().slice(0, 10);
    
    try {
      let sql = "";
      if (id) {
        sql = "SELECT * FROM crime_reported WHERE id = ? ORDER BY created_at desc";
      } else {
        sql = "SELECT * FROM crime_reported ORDER BY created_at desc";
      }

      db.query(sql, id, (err, rows) => {
        if (err) {
          console.log(`Server error controller/crime/get: ${err}`);
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
      console.log(`Server error controller/crime/post: ${error}`);
      res.status(500).json({
        status: 500,
        message: `Internal Server Error, ${error}`,
      });
    }
  })
  .post(async (req, res) => {

    const {
      officer_id,
      person_id,
      longitude,
      latitude,
      address,
      other_address,
      type_of_crime,
      description,
      witness,
      suspect_description,
    } = req.body;
    const report_number = crypto.randomUUID().split("-")[4];

    const credentials = [
      officer_id,
      person_id,
      report_number,
      longitude,
      latitude,
      address,
      other_address,
      type_of_crime,
      description,
      witness,
      suspect_description,
    ];

    console.log(credentials)

    const sql = `INSERT INTO crime_reported (officer_id, person_id, report_number, longitude, latitude,
         address, other_address, type_of_crime, description, witness, suspect_description) 
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
      db.query(sql, credentials, (err, rows) => {
        if (err) {
          console.log(`Server error controller/crime/post: ${err}`);
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
      console.log(`Server error controller/crime/post: ${error}`);
      res.status(500).json({
        status: 500,
        message: `Internal Server Error, ${error}`,
      });
    }
  });

// UPDATE AND DELETE API

router
  .route("/:id")
  .put(async (req, res) => {
    const {
      officer_id,
      person_id,
      longitude,
      latitude,
      address,
      other_address,
      type_of_crime,
      description,
      witness,
      suspect_description,
    } = req.body;
    const id = req.params.id;
    try {
      const sql = `UPDATE person_of_concern SET person_id = ?, longitude = ?, latitude = ?, address = ?, other_address = ?, type_of_crime = ?, description = ?
      witness = ?, suspect_description = ? WHERE id = ?
    `;
      const credentials = [
        person_id,
        longitude,
        latitude,
        address,
        other_address,
        type_of_crime,
        description,
        witness,
        suspect_description,
        id
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
  .delete((req, res) => {
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

const db = require("../config/db");

// Create Pet
exports.createPet = (req, res) => {
    const {
        owner_id,
        pet_name,
        species,
        breed,
        gender,
        birth_date,
        weight
    } = req.body;

    const sql = `
        INSERT INTO PET
        (owner_id, pet_name, species, breed, gender, birth_date, weight)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            owner_id,
            pet_name,
            species,
            breed,
            gender,
            birth_date,
            weight
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Pet created successfully",
                pet_id: result.insertId
            });
        }
    );
};

// Get all pets
exports.getPets = (req, res) => {
    const sql = "SELECT * FROM PET";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
};

exports.updatePet = (req, res) => {
    const {id} = req.params;
    const {
        owner_id,
        pet_name,
        species,
        breed,
        gender,
        birth_date,
        weight
    } = req.body;

    const sql = `
        UPDATE PET
        SET owner_id = ?, pet_name = ?, species = ?, breed = ?, gender = ?, birth_date = ?, weight = ?
        WHERE pet_id = ?
    `;

    db.query(
        sql,
        [
            owner_id,
            pet_name,
            species,
            breed,
            gender,
            birth_date,
            weight,
            id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Pet updated successfully"
            });
        }
    );
};

// Delete Pet
exports.deletePet = (req, res) => {
    const {id} = req.params;

    const sql = "UPDATE PET SET active_flag = FALSE WHERE pet_id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            message: "Pet deleted successfully"
        });
    });
};

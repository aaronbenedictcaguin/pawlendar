const db = require("../config/db");

// Create Pet
exports.createPet = (req, res) => {
    const owner_id = req.user.owner_id;
    const {
        pet_name,
        species,
        breed,
        gender,
        birth_date,
        weight,
        size,
        color,
        vaccination_proof_url,
        photo_url
    } = req.body;

    const sql = `
        INSERT INTO pet
        (
            owner_id,
            pet_name,
            species,
            breed,
            gender,
            birth_date,
            weight,
            size,
            color,
            vaccination_proof_url,
            photo_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            size,
            color,
            vaccination_proof_url,
            photo_url
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Pet created successfully",
                pet_id: result.insertId
            });
        }
    );
};

// Get all pets
exports.getPets = (req, res) => {
    const owner_id = req.user.owner_id;
    const sql = `SELECT
                    pet_id,
                    pet_name,
                    species,
                    breed,
                    gender,
                    birth_date,
                    weight,
                    size,
                    color,
                    vaccination_status,
                    vaccination_proof_url,
                    photo_url
                FROM pet
                WHERE owner_id = ?
                AND active_flag = TRUE;`;

    db.query(sql, [owner_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
};

exports.getPetById = (req, res) => {

    const owner_id = req.user.owner_id;
    const { id } = req.params;

    const sql =
        `SELECT 
            pet_id,
            pet_name,
            species,
            breed,
            gender,
            birth_date,
            weight,
            size,
            color,
            vaccination_status,
            vaccination_proof_url,
            photo_url 
        FROM pet 
        WHERE pet_id = ? 
        AND owner_id = ? 
        AND active_flag = TRUE;`;

    db.query(sql,[id, owner_id],(err,results)=>{

        if(err){
            return res.status(500).json({
                error: err.message
            });
        }

        if(results.length===0){
            return res.status(404).json({
                message:"Pet not found"
            });
        }

        res.json(results[0]);

    });

};

exports.updatePet = (req, res) => {
    const owner_id = req.user.owner_id;
    const {id} = req.params;
    const {
        pet_name,
        species,
        breed,
        gender,
        birth_date,
        weight,
        size,
        color,
        vaccination_proof_url,
        photo_url
    } = req.body;

    const sql = `
        UPDATE pet
            SET pet_name = ?,
            species = ?,
            breed = ?,
            gender = ?,
            birth_date = ?,
            weight = ?,
            size = ?,
            color = ?,
            vaccination_proof_url = ?,
            photo_url = ?
        WHERE pet_id = ? AND owner_id = ?
        `;

    db.query(
        sql,
        [
            pet_name,
            species,
            breed,
            gender,
            birth_date,
            weight,
            size,
            color,
            vaccination_proof_url,
            photo_url,
            id,
            owner_id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Pet not found"
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
    const owner_id = req.user.owner_id;

    const sql = "UPDATE pet SET active_flag = FALSE, updated_at = NOW() WHERE pet_id = ? AND owner_id = ?";

    db.query(sql, [id, owner_id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Pet not found"
                });
            }

        res.json({
            message: "Pet deleted successfully"
        });
    });
};

const express = require("express");
const cors = require("cors");
require("./config/db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//routes
const ownerRoutes = require("./routes/owner.routes");
const authRoutes = require("./routes/auth.routes");
const petRoutes = require("./routes/pet.routes");
const serviceRoutes = require("./routes/service.routes");

app.use("/api/owners", ownerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/services", serviceRoutes);

app.get("/", (req, res) => {
    res.send("lol testing lol");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
const express = require("express");
const path = require("path");
const cors = require("cors");
require("./config/db");

const app = express();
const env = require("dotenv");
env.config();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Customer frontend
app.use("/", express.static(path.join(__dirname, "../frontend/public")));

// Root website
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});
app.use("/customer", express.static(path.join(__dirname, "../frontend/customer")));
// Admin frontend
app.use("/admin", express.static(path.join(__dirname, "../frontend/admin")));

// Admin landing page
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/admin/admin-login.html"));
});

app.use(express.static(path.join(__dirname, "../frontend")));

//routes
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const petRoutes = require("./routes/pet.routes");
const serviceRoutes = require("./routes/service.routes");
const packageRoutes = require("./routes/package.routes");
const appointmentRoutes = require("./routes/appointments.routes");
const adminRoutes = require("./routes/admin.routes");
const loyaltyRoutes = require("./routes/loyalty.routes");


app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/loyalty", loyaltyRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

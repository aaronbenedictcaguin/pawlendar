const express = require("express");
const cors = require("cors");
require("./config/db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//routes
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const petRoutes = require("./routes/pet.routes");
const serviceRoutes = require("./routes/service.routes");
const appointmentRoutes = require("./routes/appointments.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const loyaltyRoutes = require("./routes/loyalty.routes");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/loyalty", loyaltyRoutes);

app.get("/", (req, res) => {
    res.send("lol testing lol");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
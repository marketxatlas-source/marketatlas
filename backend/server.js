require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Health check
app.get("/", (req, res) => {
    res.send("Backend Running");
});

// Register user
app.post("/api/register", async (req, res) => {
    console.log("REGISTER HIT");

    try {
        const { phone, name, email } = req.body;

        const { data, error } = await supabase
        .from("users")
        .insert([
        {
            phone,
            name,
            email
        }
        ])
        .select();

    if (error) {
        return res.status(400).json({
        success: false,
        error: error.message
        });
    }

    res.json({
        success: true,
        user: data[0]
    });

    } catch (err) {
    console.error(err);

    res.status(500).json({
        success: false
    });
    }
});

app.post("/api/test", (req, res) => {
    console.log("TEST HIT");

    res.json({
    success: true
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
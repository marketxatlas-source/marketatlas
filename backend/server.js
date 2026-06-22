require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
        db: { schema: 'public' }
    }
);

// Health check
app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.get("/api/register", (req, res) => {
    res.status(405).json({ 
        success: false, 
        error: "Method not allowed. Use POST." 
    });
});

// Register user
app.post("/api/register", async (req, res) => {
    console.log("REGISTER HIT");

    try {
        const { phone, name } = req.body;

        if (!phone || !name) {
            return res.status(400).json({
                success: false,
                error: "Phone and name are required"
            });
        }

        // Check if user already exists
        const { data: existing } = await supabase
            .from("users")
            .select("id, phone, name")
            .eq("phone", phone)
            .single();

        if (existing) {
            // User already registered — treat as success
            return res.json({
                success: true,
                user: existing,
                existing: true
            });
        }

        const { data, error } = await supabase
            .from("users")
            .insert([{ phone, name }])
            .select();

        if (error) {
            console.error("Supabase error:", error);
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
        res.status(500).json({ success: false, error: "Internal server error" });
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
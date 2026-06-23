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

        const { data: existing, error: existingError } = await supabase
    .from("users")
    .select("id")
    .eq("phone", phone)
    .limit(1);

if (existingError) {
    return res.status(500).json({
        success: false,
        error: existingError.message
    });
}

if (existing && existing.length > 0) {
    return res.status(409).json({
        success: false,
        error: "User already exists"
    });
}

        const { data, error } = await supabase
            .from("users")
            .insert([{ phone, name }])
            .select();
        
        console.log("INSERT RESULT:", JSON.stringify({ data, error }));

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

app.post("/api/check-user", async (req, res) => {
    const { phone } = req.body;

    const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .limit(1);

    if (error) {
        return res.status(500).json({
        success: false,
        error: error.message
        });
    }

    return res.json({
        success: true,
        exists: data.length > 0
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
require("dotenv").config();
console.log("SUPABASE URL:", process.env.SUPABASE_URL);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const otpStore = {};

// Health check
app.get("/", (req, res) => {
    res.send("Backend Running");
});

// Send OTP
app.post("/api/send-otp", (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(
    100000 + Math.random() * 900000
    ).toString();
    otpStore[phone] = otp;
    console.log("\n=================");
    console.log("Phone:", phone);
    console.log("OTP:", otp);
    console.log("=================\n");
    res.json({
        success: true
    });
});

// Verify OTP
app.post("/api/verify-otp", (req, res) => {
    const { phone, otp } = req.body;
    console.log("VERIFY REQUEST");
    console.log("Phone received:", phone);
    console.log("OTP received:", otp);
    console.log("Stored OTP:", otpStore[phone]);
    if (otpStore[phone] === otp) {
    delete otpStore[phone];
    return res.json({
        success: true
    });
    }
    res.json({
        success: false
    });
});

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

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
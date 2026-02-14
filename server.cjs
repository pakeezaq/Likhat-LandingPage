const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file paths
const EXCEL_FILE = path.join(__dirname, 'Likhat_Early_Access_List.xlsx');
const COUNT_FILE = path.join(__dirname, 'count.json');

// --- RESET LOGIC FOR DEMO ---
// User specifically asked for "20/50 filled" state.
// We force the count to 20 on server start to ensure the visual is correct for this session.
// In a real app, we wouldn't overwrite this, but for this specific request, we enforce it.
fs.writeFileSync(COUNT_FILE, JSON.stringify({ count: 20 }));
console.log("Count reset to 20 for '30 spots remaining' demo.");

let currentCount = 20;
const MAX_EARLY_ACCESS = 50;

// Helper to write to Excel properly
const appendToExcel = (email, status) => {
    const timestamp = new Date();
    const date = timestamp.toISOString().split('T')[0];
    const time = timestamp.toTimeString().split(' ')[0];

    let workbook;
    if (fs.existsSync(EXCEL_FILE)) {
        workbook = xlsx.readFile(EXCEL_FILE);
    } else {
        workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet([]), 'Signups');
    }

    const worksheet = workbook.Sheets['Signups'];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.some(row => row.Email === email)) {
        return { success: false, message: 'Email already registered.' };
    }

    const newRow = {
        Email: email,
        Date: date,
        Time: time,
        Status: status
    };

    data.push(newRow);
    const newWorksheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets['Signups'] = newWorksheet;
    xlsx.writeFile(workbook, EXCEL_FILE);

    return { success: true };
};

// API Routes
app.get('/api/status', (req, res) => {
    if (fs.existsSync(COUNT_FILE)) {
        currentCount = JSON.parse(fs.readFileSync(COUNT_FILE)).count;
    }
    res.json({ count: currentCount, full: currentCount >= MAX_EARLY_ACCESS });
});

app.post('/api/signup', (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Refresh count
    if (fs.existsSync(COUNT_FILE)) {
        currentCount = JSON.parse(fs.readFileSync(COUNT_FILE)).count;
    }

    let status = 'Early Access';
    let isWaitlist = false;

    if (currentCount >= MAX_EARLY_ACCESS) {
        status = 'Waitlist';
        isWaitlist = true;
    } else {
        // Increment count only for Early Access
        currentCount++;
        fs.writeFileSync(COUNT_FILE, JSON.stringify({ count: currentCount }));
    }

    const result = appendToExcel(email, status);

    if (!result.success) {
        // If duplicate, revert count if it was incremented
        if (!isWaitlist) {
            currentCount--;
            fs.writeFileSync(COUNT_FILE, JSON.stringify({ count: currentCount }));
        }
        return res.status(409).json({ error: result.message });
    }

    res.json({
        success: true,
        message: isWaitlist ? 'Spot filled. You are on the priority waitlist.' : 'Spot Secured. Welcome to likely.',
        status: status,
        count: currentCount
    });
});

app.listen(port, () => {
    console.log(`Likhat Backend running on http://localhost:${port}`);
});

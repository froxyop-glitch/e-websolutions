const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// POST endpoint to handle registration
app.post('/api/register', (req, res) => {
    const { name, email, portfolio } = req.body;

    // Simple validation
    if (!name || !email || !portfolio) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Read existing data
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const participants = JSON.parse(data);

        // Add new participant
        const newParticipant = {
            id: Date.now(),
            name,
            email,
            portfolio,
            registeredAt: new Date().toISOString()
        };

        participants.push(newParticipant);

        // Save back to file
        fs.writeFileSync(DATA_FILE, JSON.stringify(participants, null, 2));

        res.status(201).json({ message: 'Registration successful', participant: newParticipant });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET endpoint to view registrations (for admin)
app.get('/api/participants', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

/*
SQL SCHEMA:
CREATE TABLE IF NOT EXISTS founding_circle (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  city TEXT NOT NULL,
  story TEXT,
  need TEXT,
  intro TEXT,
  strategy TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { name, institution, city, story, need, intro, strategy, email } = req.body;

    if (!name || !email || !institution) {
        return res.status(400).json({ error: 'Missing required identity fields' });
    }

    try {
        await sql`
            INSERT INTO founding_circle (name, institution, city, story, need, intro, strategy, email)
            VALUES (${name}, ${institution}, ${city}, ${story}, ${need}, ${intro}, ${strategy}, ${email})
        `;

        res.json({ success: true, message: 'Application received' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
}

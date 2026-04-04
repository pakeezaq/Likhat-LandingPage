import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

/*
SQL SCHEMA:
CREATE TABLE IF NOT EXISTS deletion_requests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cnic TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'Pending Review',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { name, cnic, phone, email, reason } = req.body;

    if (!name || !cnic || !phone || !email) {
        return res.status(400).json({ error: 'Identity verification fields missing' });
    }

    try {
        await sql`
            INSERT INTO deletion_requests (name, cnic, phone, email, reason)
            VALUES (${name}, ${cnic}, ${phone}, ${email}, ${reason})
        `;

        res.json({ success: true, message: 'Deletion request logged' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Security server error' });
    }
}

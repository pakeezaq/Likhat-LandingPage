import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const MAX_EARLY_ACCESS = 50;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { email } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });

    try {
        // Check current Early Access count
        const countResult = await sql`SELECT COUNT(*)::int AS count FROM early_access WHERE status='Early Access'`;
        const currentCount = countResult[0].count;

        let status = currentCount >= MAX_EARLY_ACCESS ? 'Waitlist' : 'Early Access';

        // Insert new email
        await sql`
      INSERT INTO early_access (email, status) 
      VALUES (${email}, ${status})
      ON CONFLICT (email) DO NOTHING
    `;

        res.json({
            success: true,
            message: status === 'Waitlist'
                ? 'Early access full, you are added to the waitlist'
                : 'Spot secured! Welcome to Likhat Early Access',
            status,
            count: currentCount + (status === 'Early Access' ? 1 : 0)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

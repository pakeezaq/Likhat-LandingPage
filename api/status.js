import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const MAX_EARLY_ACCESS = 50;

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    try {
        const countResult = await sql`SELECT COUNT(*)::int AS count FROM early_access WHERE status='Early Access'`;
        const currentCount = countResult[0].count;

        res.json({
            count: currentCount,
            full: currentCount >= MAX_EARLY_ACCESS
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

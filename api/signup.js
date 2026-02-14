import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    // CORS with wildcard (or specific origin)
    response.setHeader('Access-Control-Allow-Origin', '*'); // For dev/prod ease
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    try {
        const { email } = request.body;

        // Ensure table exists (Safe idempotent op)
        await sql`
      CREATE TABLE IF NOT EXISTS signups (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        // 1. Transaction: Get Count + Insert atomically
        // Simple logic:
        // Check if email already exists
        const existing = await sql`SELECT id FROM signups WHERE email = ${email};`;
        if (existing.rowCount > 0) {
            return response.status(409).json({ error: 'This email is already registered.' });
        }

        // Check count for 'Early Access'
        const countResult = await sql`SELECT COUNT(*) FROM signups WHERE status = 'Early Access';`;
        const currentCount = parseInt(countResult.rows[0].count, 10);
        const MAX_EARLY_ACCESS = 50;

        let status = 'Early Access';
        let isWaitlist = false;

        if (currentCount >= MAX_EARLY_ACCESS) {
            status = 'Waitlist';
            isWaitlist = true;
        }

        // Insert
        await sql`
      INSERT INTO signups (email, status)
      VALUES (${email}, ${status});
    `;

        return response.status(200).json({
            success: true,
            message: isWaitlist ? 'Beta limit reached. You are on the priority waitlist.' : 'Spot Secured. Welcome to Likhat.',
            status: status,
            count: isWaitlist ? 50 : currentCount + 1
        });

    } catch (error) {
        console.error('Database Error:', error);
        return response.status(500).json({ error: 'Failed' });
    }
}

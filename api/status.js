import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    // Simple CORS handling
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    try {
        // Ensure table exists (Run this once or manually, but safe to keep for resilience)
        await sql`
      CREATE TABLE IF NOT EXISTS signups (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        // Function to get accurate count
        const countResult = await sql`SELECT COUNT(*) FROM signups WHERE status = 'Early Access';`;
        const count = parseInt(countResult.rows[0].count, 10);
        const MAX_EARLY_ACCESS = 50;

        return response.status(200).json({
            count: count,
            full: count >= MAX_EARLY_ACCESS
        });
    } catch (error) {
        console.error('Database Error:', error);
        return response.status(500).json({ error: 'Failed to fetch status' });
    }
}

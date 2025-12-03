import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const port = 3002;

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'gis'
});

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Get earthquakes with filters
app.get('/api/earthquakes', async (req, res) => {
    try {
        const { 
            limit = 10000, 
            minDepth = 0, 
            maxDepth = 100, 
            regions = 'W1,W2,W3,E1,E2,E3',
            minStations = 0,
            maxError = 1000,
            maxGap = 360
        } = req.query;

        const regionArray = regions.split(',');

        const query = `
            (
                SELECT evid, ST_X(geom) as longitude, ST_Y(geom) as latitude,
                    depth, origin_time, region, nsta, gap, max_err
                FROM earthquake.events
                WHERE catalog_id = 1
                AND depth >= $1 AND depth < 20
                AND region = ANY($3::text[])
                AND nsta >= $4 AND max_err <= $5 AND gap <= $6
                ORDER BY origin_time DESC
                LIMIT CAST($7 AS INTEGER) / 3
            )
            UNION ALL
            (
                SELECT evid, ST_X(geom) as longitude, ST_Y(geom) as latitude,
                    depth, origin_time, region, nsta, gap, max_err
                FROM earthquake.events
                WHERE catalog_id = 1
                AND depth >= 20 AND depth < 40
                AND region = ANY($3::text[])
                AND nsta >= $4 AND max_err <= $5 AND gap <= $6
                ORDER BY origin_time DESC
                LIMIT CAST($7 AS INTEGER) / 3
            )
            UNION ALL
            (
                SELECT evid, ST_X(geom) as longitude, ST_Y(geom) as latitude,
                    depth, origin_time, region, nsta, gap, max_err
                FROM earthquake.events
                WHERE catalog_id = 1
                AND depth >= 40 AND depth <= $2
                AND region = ANY($3::text[])
                AND nsta >= $4 AND max_err <= $5 AND gap <= $6
                ORDER BY origin_time DESC
                LIMIT CAST($7 AS INTEGER) / 3
            )
        `;

        const values = [
            minDepth, 
            maxDepth, 
            regionArray,
            minStations,
            maxError,
            maxGap,
            limit
        ];

        const result = await pool.query(query, values);

        res.json({
            count: result.rows.length,
            earthquakes: result.rows
        });

    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

app.listen(port, () => {
    console.log(`Earthquake API running on http://localhost:${port}`);
});
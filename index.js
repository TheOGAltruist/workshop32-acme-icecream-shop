const pg = require('pg')
const express = require('express')

const client = new pg.Client(process.env.DATABASE_URL || 'postgress://ADM508943:password@localhost/acme_icecream_shop');
const app = express();

app.use(require('morgan')('dev'));
app.use(express.json());

app.get("/api/flavors", async (req, res, next) => {
    try {
      const SQL = `SELECT * from flavors ORDER BY created_at DESC`;
  
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (error) {
      next(error);
    }
});
  
app.post('/api/flavors', async(req, res, next) => {
    try {
        const SQL = `
            INSERT INTO flavors(name, is_favorite)
            VALUES($1, $2)
            RETURNING *
        `;

        const response = await client.query(SQL, [req.body.name, req.body.is_favorite])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
});

app.put('/api/flavors/:id', async(req,res, next) => {
    try {
        const SQL = `
            UPDATE flavors
            SET name=$1, is_favorite=$2, updated_at=now()
            WHERE id=$3 RETURNING *
        `;

        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error)
    }
});

app.delete('/api/flavors/:id', async(req, res, next) => {
    try {
        const SQL = `
            DELETE from flavors
            WHERE id = $1
        `;

        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        next(error)
    }
})

const init = async () => {
    await client.connect();
    let SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            is_favorite BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        );

            INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', true);
            INSERT INTO flavors(name) VALUES('Vanila');
            INSERT INTO flavors(name) VALUES('Caramel');
    `;

    await client.query(SQL)
    
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`Listening on port ${port}`))
}

init();
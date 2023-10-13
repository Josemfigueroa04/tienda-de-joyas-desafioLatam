const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());
app.listen(3001, () => console.log('Server Running'));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'joyas',
    password: '22921748',
    port: 5432

});

pool.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Connected');
    }
});

app.get('/joyas', async (req, res) => {
    try {
        const { limits, pages, order_by } = req.query;
        let orderByClause = '';
        if (order_by) {
            const [column, direction] = order_by.split("_");
            orderByClause = `ORDER BY ${column} ${direction.toUpperCase()}`;
        }

        const limit = parseInt(limits) || 10;
        const offset = (parseInt(pages) - 1) * limit || 0;

        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM inventario ${orderByClause} LIMIT $1 OFFSET $2`, [limit, offset]);

        const stockResult = await client.query(`SELECT SUM(stock)  FROM inventario`);
        const stockTotal = stockResult.rows[0].total;

        const respuesta = {
            totaljoyas: result.rowCount,
            stockTotal: (stockTotal),
            results: result.rows.map(joya => ({
                id: joya.id,
                nombre: joya.nombre,
                precio: joya.precio,

            }))
        } 
        console.log(respuesta);
        res.json(respuesta);
       
        client.release();


    } catch (error) {
        console.log(error);
        res.status(500).json('Internal Server Error');

    }

});


app.get('/joyas/filter', async (req, res) => {
    try {
        const { precio_max, precio_min, categoria, metal } = req.query;
        let query = 'SELECT * FROM inventario 1=1';
        const values = [];

        if (precio_max) {
            query += ` AND precio <= ${index}`;
            values.push(precio_max);
            index++;
        }
        if (precio_min) {
            query += ` AND precio >= ${index}`;
            values.push(precio_min);
            index++;
        }
        if (categoria) {
            query += ` AND categoria = ${index}`;
            values.push(categoria);
            index++;
        }
        if (metal) {
            query += ` AND metal = ${index}`;
            values.push(metal);
            index++;
        }
        const client = await pool.connect();
        const result = await client.query(query, values);
        res.json(result.rows);
        client.release();


    } catch (error) {
        console.log(error);
        res.status(500).json('Internal Server Error');

    }

});




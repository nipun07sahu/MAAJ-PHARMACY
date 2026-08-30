const pool = require("../config/db");

function cleanMedicine(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price || 0),
    mrp: Number(row.mrp || 0),
    category: row.category || "",
    gst: Number(row.gst || 5),
    description: row.description || "",
    stock: Number(row.stock || 0),
    photo: row.photo || "",
    created_at: row.created_at
  };
}

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS maaj_medicines (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      mrp NUMERIC(12,2) NOT NULL DEFAULT 0,
      category VARCHAR(100) DEFAULT 'Medicine',
      gst NUMERIC(5,2) NOT NULL DEFAULT 5,
      description TEXT DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 0,
      photo TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

exports.init = ensureTable;

exports.list = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM maaj_medicines ORDER BY created_at DESC, id DESC"
    );
    res.json(result.rows.map(cleanMedicine));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to load medicines" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM maaj_medicines WHERE id=$1",
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Medicine not found" });
    res.json(cleanMedicine(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to load medicine" });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, price, mrp, category, gst, description, stock, photo } = req.body;
    if (!name || photo === undefined || photo === "") {
      return res.status(400).json({ error: "Medicine name and photo are required" });
    }

    const result = await pool.query(
      `INSERT INTO maaj_medicines
       (name, price, mrp, category, gst, description, stock, photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        String(name).trim(),
        Number(price || 0),
        Number(mrp || price || 0),
        category || "Medicine",
        Number(gst || 5),
        description || "",
        Number(stock || 0),
        photo
      ]
    );
    res.status(201).json(cleanMedicine(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to add medicine" });
  }
};

exports.bulkCreate = async (req, res) => {
  const client = await pool.connect();
  try {
    const medicines = Array.isArray(req.body.medicines) ? req.body.medicines : [];
    if (!medicines.length) return res.status(400).json({ error: "No medicines supplied" });

    await client.query("BEGIN");
    const added = [];

    for (const m of medicines) {
      if (!m.name || !m.photo) continue;
      const result = await client.query(
        `INSERT INTO maaj_medicines
         (name, price, mrp, category, gst, description, stock, photo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          String(m.name).trim(),
          Number(m.price || 0),
          Number(m.mrp || m.price || 0),
          m.category || "Medicine",
          Number(m.gst || 5),
          m.description || "",
          Number(m.stock || 0),
          m.photo
        ]
      );
      added.push(cleanMedicine(result.rows[0]));
    }

    await client.query("COMMIT");
    res.status(201).json({ added: added.length, medicines: added });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Unable to add medicines" });
  } finally {
    client.release();
  }
};

exports.update = async (req, res) => {
  try {
    const { name, price, mrp, category, gst, description, stock, photo } = req.body;
    const result = await pool.query(
      `UPDATE maaj_medicines SET
       name=$1, price=$2, mrp=$3, category=$4, gst=$5,
       description=$6, stock=$7, photo=COALESCE(NULLIF($8,''),photo)
       WHERE id=$9 RETURNING *`,
      [
        String(name || "").trim(),
        Number(price || 0),
        Number(mrp || price || 0),
        category || "Medicine",
        Number(gst || 5),
        description || "",
        Number(stock || 0),
        photo || "",
        req.params.id
      ]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Medicine not found" });
    res.json(cleanMedicine(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to update medicine" });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM maaj_medicines WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Medicine not found" });
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to delete medicine" });
  }
};
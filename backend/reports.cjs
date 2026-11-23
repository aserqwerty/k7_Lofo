async function searchReports(db, { q, type, category, location, sort }) {
  const order = sort === 'oldest' ? 'ASC' : 'DESC';
  const [rows] = await db.execute(`
    SELECT id, title, description, type, category, location,
      DATE_FORMAT(occurred_at, '%Y-%m-%d') AS occurredAt
    FROM reports
    WHERE status = 'verified'
      AND (? = '' OR INSTR(LOWER(CONCAT_WS(' ', title, description, location)), LOWER(?)) > 0)
      AND (? = '' OR type = ?)
      AND (? = '' OR category = ?)
      AND (? = '' OR location = ?)
    ORDER BY occurred_at ${order}, id ${order}
  `, [q, q, type, type, category, category, location, location]);
  return rows;
}

module.exports = { searchReports };

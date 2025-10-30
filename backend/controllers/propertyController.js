const db = require('../config/database');

const getAllProperties = async (req, res) => {
  try {
    const { city, property_type, listing_type, min_price, max_price, bedrooms, status } = req.query;

    let query = `
      SELECT p.*, u.full_name as agent_name, u.email as agent_email, u.phone as agent_phone,
             (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (city) {
      query += ' AND p.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (property_type) {
      query += ' AND p.property_type = ?';
      params.push(property_type);
    }
    if (listing_type) {
      query += ' AND p.listing_type = ?';
      params.push(listing_type);
    }
    if (min_price) {
      query += ' AND p.price >= ?';
      params.push(min_price);
    }
    if (max_price) {
      query += ' AND p.price <= ?';
      params.push(max_price);
    }
    if (bedrooms) {
      query += ' AND p.bedrooms >= ?';
      params.push(bedrooms);
    }
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.featured DESC, p.created_at DESC';

    const [properties] = await db.query(query, params);
    res.json({ properties });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const [properties] = await db.query(
      `SELECT p.*, u.full_name as agent_name, u.email as agent_email, u.phone as agent_phone
       FROM properties p
       LEFT JOIN users u ON p.agent_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const [images] = await db.query(
      'SELECT * FROM property_images WHERE property_id = ? ORDER BY is_primary DESC',
      [req.params.id]
    );

    res.json({ property: { ...properties[0], images } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const {
      title, description, property_type, listing_type, price, address,
      city, state, zip_code, country, bedrooms, bathrooms, area_sqft,
      year_built, featured, images
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO properties (title, description, property_type, listing_type, price,
       address, city, state, zip_code, country, bedrooms, bathrooms, area_sqft,
       year_built, featured, agent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, property_type, listing_type, price, address, city, state,
       zip_code, country || 'USA', bedrooms || 0, bathrooms || 0, area_sqft,
       year_built || null, featured || false, req.user.id]
    );

    const propertyId = result.insertId;

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.query(
          'INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)',
          [propertyId, images[i], i === 0]
        );
      }
    }

    res.status(201).json({ message: 'Property created successfully', propertyId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const {
      title, description, property_type, listing_type, price, address,
      city, state, zip_code, country, bedrooms, bathrooms, area_sqft,
      year_built, status, featured
    } = req.body;

    const [properties] = await db.query('SELECT agent_id FROM properties WHERE id = ?', [propertyId]);
    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (properties[0].agent_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.query(
      `UPDATE properties SET title = ?, description = ?, property_type = ?, listing_type = ?,
       price = ?, address = ?, city = ?, state = ?, zip_code = ?, country = ?, bedrooms = ?,
       bathrooms = ?, area_sqft = ?, year_built = ?, status = ?, featured = ? WHERE id = ?`,
      [title, description, property_type, listing_type, price, address, city, state, zip_code,
       country, bedrooms, bathrooms, area_sqft, year_built, status, featured, propertyId]
    );

    res.json({ message: 'Property updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const [properties] = await db.query('SELECT agent_id FROM properties WHERE id = ?', [propertyId]);
    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (properties[0].agent_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.query('DELETE FROM properties WHERE id = ?', [propertyId]);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};

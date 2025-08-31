const express = require('express');
const { admin } = require('../config/firebase');
const { authenticateUser } = require('../middleware/auth');
const { validateProductData } = require('../middleware/validation');
const pdfService = require('../services/pdfService');
const path = require('path');

const router = express.Router();

// Get all products for a company
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const { status, category, limit = 50, offset = 0 } = req.query;
    const db = admin.firestore();

    // For single company model, get all products (could filter by userId if needed)
    let query = db.collection('products');

    const snapshot = await query.get();
    let products = [];

    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Apply filters in memory
    if (status) {
      products = products.filter(p => p.status === status);
    }
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // Sort by submittedAt in descending order
    products.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.createdAt || 0);
      const dateB = new Date(b.submittedAt || b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      pagination: {
        total: products.length,
        offset: parseInt(offset),
        limit: parseInt(limit),
        hasMore: endIndex < products.length
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a specific product
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const db = admin.firestore();

    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productData = productDoc.data();
    
    // Ensure the product belongs to the authenticated user
    if (productData.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: productDoc.id,
      ...productData
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create a new product
router.post('/', authenticateUser, validateProductData, async (req, res) => {
  try {
    const { userId } = req.user;
    const productData = {
      ...req.validatedData,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const db = admin.firestore();
    const productRef = await db.collection('products').add(productData);

    res.status(201).json({
      message: 'Product created successfully',
      productId: productRef.id
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product
router.put('/:id', authenticateUser, validateProductData, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const db = admin.firestore();

    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingData = productDoc.data();
    
    // Ensure the product belongs to the authenticated user
    if (existingData.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedData = {
      ...req.validatedData,
      userId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await productDoc.ref.update(updatedData);

    res.json({ message: 'Product updated successfully' });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const db = admin.firestore();

    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productData = productDoc.data();
    
    // Ensure the product belongs to the authenticated user
    if (productData.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await productDoc.ref.delete();

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Generate PDF report for a product
router.get('/:id/pdf', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const db = admin.firestore();

    // Get product data
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productData = { id: productDoc.id, ...productDoc.data() };
    
    // Ensure the product belongs to the authenticated user
    if (productData.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Single-company model: provide default company data
    const companyData = {
      id: 'single-company',
      companyName: 'Altibbe',
      contactPerson: `${req.userData?.firstName || req.user.firstName || ''} ${req.userData?.lastName || req.user.lastName || ''}`.trim(),
      email: req.userData?.email || req.user.email || 'noreply@altibbe.com',
      industry: 'N/A'
    };

    // Generate PDF
    const { filePath, fileName } = await pdfService.generateProductReport(productData, companyData);

    // Send PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fs = require('fs');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up file after sending
    fileStream.on('end', () => {
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

// Generate summary PDF report for all products
router.get('/reports/summary', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const { startDate, endDate } = req.query;
    const db = admin.firestore();

    // Build query for products
    let query = db.collection('products').where('userId', '==', userId);
    
    // Apply date filters if provided
    if (startDate) {
      query = query.where('submittedAt', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('submittedAt', '<=', new Date(endDate));
    }

    const snapshot = await query.get();
    const products = [];

    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Single-company model: provide default company data
    const companyData = {
      id: 'single-company',
      companyName: 'Altibbe',
      contactPerson: `${req.userData?.firstName || req.user.firstName || ''} ${req.userData?.lastName || req.user.lastName || ''}`.trim(),
      email: req.userData?.email || req.user.email || 'noreply@altibbe.com'
    };

    // Generate PDF
    const dateRange = startDate && endDate ? {
      start: new Date(startDate).toLocaleDateString(),
      end: new Date(endDate).toLocaleDateString()
    } : null;

    const { filePath, fileName } = await pdfService.generateSummaryReport(products, companyData, dateRange);

    // Send PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fs = require('fs');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up file after sending
    fileStream.on('end', () => {
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error('Error generating summary PDF:', error);
    res.status(500).json({ error: 'Failed to generate summary report' });
  }
});

module.exports = router;

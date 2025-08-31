const express = require('express');
const { admin } = require('../config/firebase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Get all reports for a company
router.get('/', async (req, res) => {
  try {
    // Check if Firebase is available
    if (!admin.apps.length) {
      console.log('Firebase not initialized, returning mock data');
      return res.json({ reports: [] });
    }

    const db = admin.firestore();

    // For single-company model, get all reports
    const reportsSnapshot = await db.collection('reports').get();

    // Sort in memory instead of using Firestore orderBy
    const reports = [];
    reportsSnapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by generatedAt in descending order (most recent first)
    reports.sort((a, b) => {
      const dateA = a.generatedAt?.toDate?.() || new Date(a.generatedAt || 0);
      const dateB = b.generatedAt?.toDate?.() || new Date(b.generatedAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Generate a new report
router.post('/generate', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const { productIds, reportType, title } = req.body;

    // Check if Firebase is available
    if (!admin.apps.length) {
      console.log('Firebase not initialized, cannot generate reports');
      return res.status(500).json({ error: 'Database not available' });
    }

    const db = admin.firestore();

    // Get products for the report
    const products = [];
    if (productIds && productIds.length > 0) {
      for (const productId of productIds) {
        const productDoc = await db.collection('products').doc(productId).get();
        if (productDoc.exists) {
          products.push({
            id: productDoc.id,
            ...productDoc.data()
          });
        }
      }
    } else {
      // Get all products for the user
      const productsSnapshot = await db.collection('products')
        .where('userId', '==', userId)
        .get();

      productsSnapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    // Calculate transparency score (mock calculation)
    const transparencyScore = Math.floor(Math.random() * 20) + 80; // 80-99

    // Create report data
    const reportData = {
      userId,
      title: title || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      productCount: products.length,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed',
      transparencyScore,
      type: reportType,
      products: products.map(p => ({
        id: p.id,
        productName: p.productName,
        category: p.category,
        status: p.status
      })),
      summary: {
        totalProducts: products.length,
        approvedProducts: products.filter(p => p.status === 'approved').length,
        submittedProducts: products.filter(p => p.status === 'submitted').length,
        draftProducts: products.filter(p => p.status === 'draft').length
      }
    };

    // Save report to database
    const reportRef = await db.collection('reports').add(reportData);

    console.log('Report generated successfully:', reportRef.id);

    res.status(201).json({
      message: 'Report generated successfully',
      reportId: reportRef.id,
      report: {
        id: reportRef.id,
        ...reportData,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get a specific report
router.get('/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;

    const db = admin.firestore();
    const reportDoc = await db.collection('reports').doc(reportId).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = reportDoc.data();

    res.json({
      report: {
        id: reportDoc.id,
        ...reportData
      }
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Download report (mock implementation)
router.get('/:reportId/download', async (req, res) => {
  try {
    const { reportId } = req.params;

    const db = admin.firestore();
    const reportDoc = await db.collection('reports').doc(reportId).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = reportDoc.data();

    // Mock PDF generation - in a real app, you'd generate a PDF here
    const pdfContent = `
Product Transparency Report
==========================

Report Type: ${reportData.type}
Generated: ${reportData.generatedAt?.toDate?.()?.toISOString() || new Date().toISOString()}
Products Covered: ${reportData.productCount}

Transparency Score: ${reportData.transparencyScore}%

Summary:
- Total Products: ${reportData.summary?.totalProducts || 0}
- Approved Products: ${reportData.summary?.approvedProducts || 0}
- Submitted Products: ${reportData.summary?.submittedProducts || 0}
- Draft Products: ${reportData.summary?.draftProducts || 0}

Generated by Altibbe Product Transparency Platform
`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${reportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt"`);
    res.send(pdfContent);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
});

// Delete a report
router.delete('/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;

    const db = admin.firestore();
    const reportDoc = await db.collection('reports').doc(reportId).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await db.collection('reports').doc(reportId).delete();

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

module.exports = router;

const express = require('express');
const { admin } = require('../config/firebase');
const { authenticateUser } = require('../middleware/auth');
const pdfService = require('../services/pdfService');

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
    const { productIds, reportType, title, quarter } = req.body;

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
      ...(quarter && { quarter }),
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

// Debug endpoint
router.get('/test/debug', (req, res) => {
  res.json({
    message: 'Reports route is working!',
    timestamp: new Date().toISOString(),
    pdfServiceAvailable: !!require('../services/pdfService')
  });
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

// Download report as PDF
router.get('/:reportId/download', async (req, res) => {
  try {
    const { reportId } = req.params;
    console.log(`Starting PDF download for report: ${reportId}`);

    // Check if Firebase is available
    if (!admin.apps.length) {
      console.log('Firebase not initialized, cannot download reports');
      return res.status(500).json({ error: 'Database not available' });
    }

    const db = admin.firestore();
    const reportDoc = await db.collection('reports').doc(reportId).get();

    if (!reportDoc.exists) {
      console.log(`Report ${reportId} not found`);
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = reportDoc.data();
    console.log(`Report data retrieved for: ${reportData.title}`);

    // Get user information for company data
    const userDoc = await db.collection('users').doc(reportData.userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    console.log(`User data retrieved:`, userData.companyName || 'No company data');

    // Prepare company data
    const companyData = {
      companyName: userData.companyName || 'Unknown Company',
      contactPerson: userData.contactPerson || userData.firstName + ' ' + userData.lastName || 'Unknown Contact',
      email: userData.email || 'unknown@email.com',
      industry: userData.industry || 'Unknown Industry'
    };

    // Get full product data for the report
    const products = [];
    for (const product of reportData.products || []) {
      const productDoc = await db.collection('products').doc(product.id).get();
      if (productDoc.exists) {
        const productData = productDoc.data();
        products.push({
          id: productDoc.id,
          ...productData
        });
      }
    }
    console.log(`Retrieved ${products.length} products for the report`);

    // Generate PDF based on report type
    let pdfResult;
    if (reportData.type === 'summary' || products.length > 1) {
      console.log('Generating summary report PDF');
      // Generate summary report
      pdfResult = await pdfService.generateSummaryReport(products, companyData, null);
    } else {
      console.log('Generating single product report PDF');
      // Generate single product report
      const productData = products[0];
      if (productData) {
        pdfResult = await pdfService.generateProductReport(productData, companyData);
      } else {
        console.log('No product data found for report');
        return res.status(404).json({ error: 'No product data found for report' });
      }
    }

    console.log(`PDF generated at: ${pdfResult.filePath}`);
    console.log(`File size expected: ${pdfResult.fileName}`);

    // Check if file exists before streaming
    const fs = require('fs');
    if (!fs.existsSync(pdfResult.filePath)) {
      console.error(`PDF file not found at: ${pdfResult.filePath}`);
      return res.status(500).json({ error: 'PDF file was not generated' });
    }

    const stats = fs.statSync(pdfResult.filePath);
    console.log(`PDF file size: ${stats.size} bytes`);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`);
    res.setHeader('Content-Length', stats.size);

    // Stream the PDF file
    const fileStream = fs.createReadStream(pdfResult.filePath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      console.log('PDF file streamed successfully');
      // Clean up the temporary file after sending
      try {
        if (fs.existsSync(pdfResult.filePath)) {
          fs.unlinkSync(pdfResult.filePath);
          console.log('Temporary PDF file cleaned up');
        }
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    });

    fileStream.on('error', (error) => {
      console.error('Error streaming PDF file:', error);
      // Don't try to send JSON response if headers are already sent
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream PDF file' });
      }
    });

  } catch (error) {
    console.error('Error downloading report:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download report' });
    }
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

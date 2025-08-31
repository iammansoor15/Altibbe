const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  generateProductReport(productData, companyData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `product_report_${productData.id}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../temp', fileName);

        // Ensure temp directory exists
        const tempDir = path.dirname(filePath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Product Report', { align: 'center' });
        doc.moveDown();

        // Company Information
        doc.fontSize(16).text('Company Information', { underline: true });
        doc.fontSize(12)
           .text(`Company: ${companyData.companyName}`)
           .text(`Contact: ${companyData.contactPerson}`)
           .text(`Email: ${companyData.email}`)
           .text(`Industry: ${companyData.industry}`);
        doc.moveDown();

        // Product Information
        doc.fontSize(16).text('Product Information', { underline: true });
        doc.fontSize(12)
           .text(`Product Name: ${productData.productName}`)
           .text(`Category: ${productData.category}`)
           .text(`Description: ${productData.description || 'N/A'}`)
           .text(`Price: ${productData.price ? '$' + productData.price : 'N/A'}`)
           .text(`Status: ${productData.status}`)
           .text(`Submitted: ${new Date(productData.submittedAt).toLocaleDateString()}`);
        doc.moveDown();

        // Specifications
        if (productData.specifications && Object.keys(productData.specifications).length > 0) {
          doc.fontSize(16).text('Specifications', { underline: true });
          doc.fontSize(12);
          Object.entries(productData.specifications).forEach(([key, value]) => {
            doc.text(`${key}: ${value}`);
          });
          doc.moveDown();
        }

        // Questions and Answers
        if (productData.questions && productData.questions.length > 0) {
          doc.fontSize(16).text('Questions & Answers', { underline: true });
          doc.fontSize(12);
          
          productData.questions.forEach((qa, index) => {
            doc.text(`${index + 1}. ${qa.question}`);
            let answer = qa.answer;
            if (Array.isArray(answer)) {
              answer = answer.join(', ');
            } else if (typeof answer === 'boolean') {
              answer = answer ? 'Yes' : 'No';
            }
            doc.text(`   Answer: ${answer}`, { indent: 20 });
            doc.moveDown(0.5);
          });
        }

        // Footer
        doc.fontSize(10)
           .text(`Generated on ${new Date().toLocaleString()}`, 50, doc.page.height - 50);

        doc.end();

        stream.on('finish', () => {
          resolve({ filePath, fileName });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  generateSummaryReport(products, companyData, dateRange) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `summary_report_${companyData.id}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../temp', fileName);

        // Ensure temp directory exists
        const tempDir = path.dirname(filePath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Product Summary Report', { align: 'center' });
        doc.moveDown();

        // Company Information
        doc.fontSize(16).text('Company Information', { underline: true });
        doc.fontSize(12)
           .text(`Company: ${companyData.companyName}`)
           .text(`Contact: ${companyData.contactPerson}`)
           .text(`Total Products: ${products.length}`);
        doc.moveDown();

        // Date Range
        if (dateRange) {
          doc.fontSize(14).text(`Report Period: ${dateRange.start} to ${dateRange.end}`);
          doc.moveDown();
        }

        // Statistics
        const stats = this.calculateStats(products);
        doc.fontSize(16).text('Statistics', { underline: true });
        doc.fontSize(12)
           .text(`Total Products: ${stats.total}`)
           .text(`Submitted: ${stats.submitted}`)
           .text(`Approved: ${stats.approved}`)
           .text(`Rejected: ${stats.rejected}`)
           .text(`Draft: ${stats.draft}`);
        doc.moveDown();

        // Category Breakdown
        if (stats.categories && Object.keys(stats.categories).length > 0) {
          doc.fontSize(16).text('Categories', { underline: true });
          doc.fontSize(12);
          Object.entries(stats.categories).forEach(([category, count]) => {
            doc.text(`${category}: ${count} products`);
          });
          doc.moveDown();
        }

        // Product List
        doc.fontSize(16).text('Product List', { underline: true });
        doc.fontSize(10);
        
        products.forEach((product, index) => {
          doc.text(`${index + 1}. ${product.productName}`);
          doc.text(`   Category: ${product.category} | Status: ${product.status}`, { indent: 20 });
          doc.text(`   Submitted: ${new Date(product.submittedAt).toLocaleDateString()}`, { indent: 20 });
          doc.moveDown(0.3);
        });

        // Footer
        doc.fontSize(10)
           .text(`Generated on ${new Date().toLocaleString()}`, 50, doc.page.height - 50);

        doc.end();

        stream.on('finish', () => {
          resolve({ filePath, fileName });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  calculateStats(products) {
    const stats = {
      total: products.length,
      submitted: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      categories: {}
    };

    products.forEach(product => {
      // Status counts
      stats[product.status] = (stats[product.status] || 0) + 1;
      
      // Category counts
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    });

    return stats;
  }

  cleanupTempFiles() {
    const tempDir = path.join(__dirname, '../temp');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtime.getTime() > oneHour) {
          fs.unlinkSync(filePath);
        }
      });
    }
  }
}

module.exports = new PDFService();

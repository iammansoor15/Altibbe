const express = require('express');
const { admin } = require('../config/firebase');
const { authenticateUser } = require('../middleware/auth');
const { validateProductData } = require('../middleware/validation');
const pdfService = require('../services/pdfService');
const path = require('path');

const router = express.Router();

// Get all products for a company with search functionality
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const { status, category, search, productType, limit = 50, offset = 0 } = req.query;
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
    if (productType) {
      products = products.filter(p => p.productType === productType);
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(p => {
        return (
          (p.productName && p.productName.toLowerCase().includes(searchTerm)) ||
          (p.description && p.description.toLowerCase().includes(searchTerm)) ||
          (p.category && p.category.toLowerCase().includes(searchTerm)) ||
          (p.productType && p.productType.toLowerCase().includes(searchTerm)) ||
          (p.brand && p.brand.toLowerCase().includes(searchTerm)) ||
          (p.model && p.model.toLowerCase().includes(searchTerm))
        );
      });
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
      },
      filters: {
        availableCategories: [...new Set(products.map(p => p.category).filter(Boolean))],
        availableProductTypes: [...new Set(products.map(p => p.productType).filter(Boolean))],
        availableStatuses: [...new Set(products.map(p => p.status).filter(Boolean))]
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Try Firebase first, fallback to mock if fails
    try {
      const db = admin.firestore();
      const productRef = await db.collection('products').add({
        ...productData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(201).json({
        message: 'Product created successfully',
        productId: productRef.id
      });
    } catch (firebaseError) {
      console.error('Firebase product creation failed:', firebaseError);
      console.log('Using mock product creation for development...');
      
      // Mock product creation for development
      const mockProductId = 'mock-product-' + Date.now();
      
      res.status(201).json({
        message: 'Product created successfully (mock mode)',
        productId: mockProductId
      });
    }

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
    
    let productData;

    // Handle mock products vs Firebase products
    if (id.startsWith('mock-product-')) {
      // Mock product data for development
      productData = {
        id: id,
        productName: 'Test Product',
        category: 'Electronics',
        description: 'A test product for demo',
        price: 99.99,
        status: 'draft',
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      // Try to get from Firebase
      try {
        const db = admin.firestore();
        const productDoc = await db.collection('products').doc(id).get();
        
        if (!productDoc.exists) {
          return res.status(404).json({ error: 'Product not found' });
        }

        productData = { id: productDoc.id, ...productDoc.data() };
        
        // Ensure the product belongs to the authenticated user
        if (productData.userId !== userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } catch (firebaseError) {
        console.error('Firebase product lookup failed:', firebaseError);
        return res.status(404).json({ error: 'Product not found' });
      }
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

// Get available product categories and types
router.get('/meta/options', async (req, res) => {
  try {
    const categories = [
      'Electronics & Gadgets',
      'Fashion & Clothing',
      'Home & Kitchen',
      'Beauty & Personal Care',
      'Sports & Fitness',
      'Books & Stationery',
      'Toys & Games',
      'Automotive & Tools',
      'Health & Wellness',
      'Jewelry & Accessories',
      'Baby & Kids',
      'Pet Supplies',
      'Office & School Supplies',
      'Grocery & Gourmet',
      'Garden & Outdoor',
      'Industrial & Scientific',
      'Digital Products',
      'Services',
      'Other'
    ];

    const productTypes = {
      'Electronics & Gadgets': [
        'Smartphones',
        'Laptops & Computers',
        'Tablets',
        'Smart Watches & Wearables',
        'Headphones & Audio',
        'Cameras',
        'Gaming & Consoles',
        'TVs & Monitors',
        'Smart Home Devices',
        'Chargers & Cables',
        'Computer Accessories',
        'Drones',
        'Other Electronics'
      ],
      'Fashion & Clothing': [
        'Men\'s Clothing',
        'Women\'s Clothing',
        'Kids\' Clothing',
        'Shoes',
        'Bags & Wallets',
        'Watches',
        'Jewelry',
        'Sunglasses',
        'Belts',
        'Hats & Caps',
        'Scarves',
        'Other Fashion'
      ],
      'Home & Kitchen': [
        'Furniture',
        'Home Decor',
        'Kitchen Appliances',
        'Cookware & Bakeware',
        'Dining & Serveware',
        'Bedding & Linens',
        'Bathroom Accessories',
        'Cleaning Supplies',
        'Storage & Organization',
        'Lighting',
        'Curtains & Blinds',
        'Other Home & Kitchen'
      ],
      'Beauty & Personal Care': [
        'Skincare',
        'Makeup',
        'Hair Care',
        'Fragrances',
        'Bath & Body',
        'Nail Care',
        'Tools & Accessories',
        'Men\'s Grooming',
        'Oral Care',
        'Eye Care',
        'Other Beauty'
      ],
      'Sports & Fitness': [
        'Exercise Equipment',
        'Yoga & Pilates',
        'Strength Training',
        'Cardio Equipment',
        'Sports Apparel',
        'Footwear',
        'Nutrition & Supplements',
        'Sports Accessories',
        'Outdoor Gear',
        'Team Sports',
        'Water Sports',
        'Other Sports'
      ],
      'Books & Stationery': [
        'Fiction Books',
        'Non-Fiction Books',
        'Textbooks',
        'Children\'s Books',
        'Cookbooks',
        'Art & Photography',
        'Business & Economics',
        'Self-Help',
        'Notebooks & Journals',
        'Pens & Pencils',
        'Art Supplies',
        'Calendars & Planners'
      ],
      'Toys & Games': [
        'Action Figures',
        'Board Games',
        'Building Toys',
        'Dolls & Accessories',
        'Educational Toys',
        'Outdoor Toys',
        'Puzzles',
        'Video Games',
        'Ride-On Toys',
        'Stuffed Animals',
        'Party Supplies',
        'Other Toys'
      ],
      'Automotive & Tools': [
        'Car Parts',
        'Motorcycle Parts',
        'Car Accessories',
        'Tools & Hardware',
        'Maintenance Products',
        'Car Electronics',
        'Interior Accessories',
        'Exterior Accessories',
        'Tires & Wheels',
        'Safety & Security',
        'Other Automotive'
      ],
      'Health & Wellness': [
        'Vitamins & Supplements',
        'Herbal Remedies',
        'Fitness Trackers',
        'Massage Tools',
        'Meditation Aids',
        'Sleep Aids',
        'Weight Management',
        'First Aid',
        'Medical Devices',
        'Mental Health',
        'Alternative Medicine',
        'Other Health'
      ],
      'Jewelry & Accessories': [
        'Necklaces',
        'Earrings',
        'Bracelets',
        'Rings',
        'Watches',
        'Hair Accessories',
        'Belts',
        'Scarves',
        'Gloves',
        'Hats',
        'Sunglasses',
        'Other Accessories'
      ],
      'Baby & Kids': [
        'Baby Clothing',
        'Kids Clothing',
        'Baby Gear',
        'Nursery Furniture',
        'Feeding Supplies',
        'Diapers & Wipes',
        'Bath & Skin Care',
        'Toys & Games',
        'Books',
        'School Supplies',
        'Safety Products',
        'Other Baby & Kids'
      ],
      'Pet Supplies': [
        'Dog Food & Treats',
        'Cat Food & Treats',
        'Pet Toys',
        'Pet Beds',
        'Grooming Supplies',
        'Collars & Leashes',
        'Pet Clothing',
        'Aquarium Supplies',
        'Bird Supplies',
        'Small Animal Supplies',
        'Pet Health',
        'Other Pet Supplies'
      ],
      'Office & School Supplies': [
        'Notebooks & Journals',
        'Pens & Pencils',
        'Desk Accessories',
        'Filing & Storage',
        'Office Furniture',
        'Printers & Ink',
        'Computer Accessories',
        'Whiteboards',
        'Calendars',
        'Envelopes & Mailers',
        'Other Office Supplies'
      ],
      'Grocery & Gourmet': [
        'Snacks',
        'Beverages',
        'Pantry Staples',
        'Fresh Produce',
        'Dairy Products',
        'Meat & Seafood',
        'Bakery',
        'Frozen Foods',
        'Organic Products',
        'International Foods',
        'Dietary Foods',
        'Other Grocery'
      ],
      'Garden & Outdoor': [
        'Plants & Seeds',
        'Gardening Tools',
        'Outdoor Furniture',
        'BBQ & Grills',
        'Patio & Garden',
        'Lawn Care',
        'Outdoor Lighting',
        'Watering Equipment',
        'Pest Control',
        'Greenhouses',
        'Gardening Supplies',
        'Other Outdoor'
      ],
      'Industrial & Scientific': [
        'Lab Equipment',
        'Safety Equipment',
        'Industrial Tools',
        'Electrical Equipment',
        'Fasteners',
        'Pipes & Fittings',
        'Raw Materials',
        'Packaging Supplies',
        'Measurement Tools',
        'Machinery Parts',
        'Other Industrial'
      ],
      'Digital Products': [
        'Software',
        'E-books',
        'Online Courses',
        'Stock Photos',
        'Graphics & Templates',
        'Music & Audio',
        'Video Content',
        'Web Templates',
        'Mobile Apps',
        'Games',
        'Other Digital'
      ],
      'Services': [
        'Consulting Services',
        'Digital Marketing',
        'Web Development',
        'Graphic Design',
        'Photography',
        'Event Planning',
        'Home Services',
        'Tutoring',
        'Fitness Training',
        'Other Services'
      ],
      'Other': [
        'Custom Products',
        'Bulk Orders',
        'Clearance Items',
        'Vintage Items',
        'Collectibles',
        'Miscellaneous'
      ]
    };

    res.json({
      categories,
      productTypes,
      allProductTypes: Object.values(productTypes).flat()
    });

  } catch (error) {
    console.error('Error fetching product options:', error);
    res.status(500).json({ error: 'Failed to fetch product options' });
  }
});

// Seed some sample products for demonstration
router.post('/seed/demo', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const db = admin.firestore();

    const sampleProducts = [
      {
        productName: 'Samsung Galaxy S24 Ultra',
        category: 'Electronics & Gadgets',
        productType: 'Smartphones',
        brand: 'Samsung',
        model: 'SM-S928B',
        description: 'Premium smartphone with S Pen, 200MP camera, and AI features',
        price: 1199,
        status: 'draft',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        productName: 'MacBook Pro 16-inch M3',
        category: 'Electronics & Gadgets',
        productType: 'Laptops & Computers',
        brand: 'Apple',
        model: 'Z16T',
        description: 'Powerful laptop with M3 chip, Liquid Retina XDR display',
        price: 2499,
        status: 'submitted',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        productName: 'The Lean Startup',
        category: 'Books & Stationery',
        productType: 'Business & Economics',
        brand: 'Crown Business',
        description: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses',
        price: 24.99,
        status: 'approved',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        productName: 'Nike Air Jordan 1 Retro High',
        category: 'Fashion & Clothing',
        productType: 'Shoes',
        brand: 'Nike',
        model: '555088-063',
        description: 'Classic basketball sneakers with premium leather construction',
        price: 170,
        status: 'draft',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        productName: 'Amazon Echo Dot (5th Gen)',
        category: 'Electronics & Gadgets',
        productType: 'Smart Home Devices',
        brand: 'Amazon',
        model: 'B09B8V1LZ3',
        description: 'Smart speaker with Alexa and improved audio quality',
        price: 49.99,
        status: 'submitted',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        productName: 'Organic Green Tea - 100 Tea Bags',
        category: 'Grocery & Gourmet',
        productType: 'Beverages',
        brand: 'Premium Teas Co.',
        description: 'Premium organic green tea bags, antioxidant-rich and caffeine-free option available',
        price: 15.99,
        status: 'approved',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        productName: 'LEGO Creator 3-in-1 Deep Sea Creatures',
        category: 'Toys & Games',
        productType: 'Building Toys',
        brand: 'LEGO',
        model: '31088',
        description: 'Build 3 different sea creatures: an angler fish, a manta ray, and a shark',
        price: 79.99,
        status: 'draft',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        productName: 'Yoga Mat Premium Non-Slip',
        category: 'Sports & Fitness',
        productType: 'Yoga & Pilates',
        brand: 'FitLife',
        model: 'YM-001',
        description: '6mm thick TPE yoga mat with superior grip and cushioning',
        price: 39.99,
        status: 'submitted',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const promises = sampleProducts.map(product => 
      db.collection('products').add({
        ...product,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    );

    await Promise.all(promises);

    res.json({
      message: 'Demo products seeded successfully',
      count: sampleProducts.length
    });

  } catch (error) {
    console.error('Error seeding demo products:', error);
    res.status(500).json({ error: 'Failed to seed demo products' });
  }
});

module.exports = router;

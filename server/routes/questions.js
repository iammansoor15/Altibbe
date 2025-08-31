const express = require('express');
const { admin } = require('../config/firebase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Get all question templates
router.get('/', async (req, res) => {
  try {
    // Check if Firebase is available
    if (!admin.apps.length) {
      console.log('Firebase not available, returning fallback questions');
      return res.json({ questions: [] });
    }

    const { category } = req.query;
    const db = admin.firestore();

    let query = db.collection('questionTemplates');
    
    if (category) {
      query = query.where('categories', 'array-contains', category);
    }

    const snapshot = await query.get();
    const questions = [];

    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by order in memory
    questions.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({ questions });

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.json({ questions: [] }); // Return empty array instead of error
  }
});

// Get questions for a specific category with conditional logic
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const db = admin.firestore();

    // Simple query without orderBy to avoid index requirement
    const snapshot = await db.collection('questionTemplates')
      .where('categories', 'array-contains', category)
      .get();

    const questions = [];
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by order in memory
    questions.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({ questions });

  } catch (error) {
    console.error('Error fetching category questions:', error);
    res.status(500).json({ error: 'Failed to fetch category questions' });
  }
});

// Create a custom question template (admin only - for demo purposes, we'll allow authenticated companies)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      question,
      type,
      required = false,
      options = [],
      categories = [],
      conditionalLogic = null,
      validationRules = {},
      helpText = '',
      order = 0
    } = req.body;

    // Validate required fields
    if (!question || !type) {
      return res.status(400).json({ error: 'Question and type are required' });
    }

    // Validate question type
    const validTypes = ['text', 'number', 'boolean', 'select', 'multiselect', 'date', 'email', 'phone', 'textarea'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid question type' });
    }

    const questionData = {
      question,
      type,
      required,
      options,
      categories,
      conditionalLogic,
      validationRules,
      helpText,
      order,
      createdBy: req.user.userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    };

    const db = admin.firestore();
    const questionRef = await db.collection('questionTemplates').add(questionData);

    res.status(201).json({
      message: 'Question template created successfully',
      questionId: questionRef.id
    });

  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question template' });
  }
});

// Update a question template
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question,
      type,
      required,
      options,
      categories,
      conditionalLogic,
      validationRules,
      helpText,
      order
    } = req.body;

    const db = admin.firestore();
    const questionDoc = await db.collection('questionTemplates').doc(id).get();

    if (!questionDoc.exists) {
      return res.status(404).json({ error: 'Question template not found' });
    }

    const existingData = questionDoc.data();
    
    // For demo purposes, allow any authenticated company to update
    // In production, you might want to restrict this to admin users or question creators

    const updatedData = {
      question: question || existingData.question,
      type: type || existingData.type,
      required: required !== undefined ? required : existingData.required,
      options: options || existingData.options,
      categories: categories || existingData.categories,
      conditionalLogic: conditionalLogic !== undefined ? conditionalLogic : existingData.conditionalLogic,
      validationRules: validationRules || existingData.validationRules,
      helpText: helpText !== undefined ? helpText : existingData.helpText,
      order: order !== undefined ? order : existingData.order,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await questionDoc.ref.update(updatedData);

    res.json({ message: 'Question template updated successfully' });

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question template' });
  }
});

// Delete a question template
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const db = admin.firestore();

    const questionDoc = await db.collection('questionTemplates').doc(id).get();

    if (!questionDoc.exists) {
      return res.status(404).json({ error: 'Question template not found' });
    }

    // Soft delete by setting isActive to false
    await questionDoc.ref.update({
      isActive: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: 'Question template deleted successfully' });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question template' });
  }
});

// Get available categories
router.get('/categories', async (req, res) => {
  try {
    // Check if Firebase is available
    if (!admin.apps.length) {
      console.log('Firebase not available, returning fallback categories');
      const fallbackCategories = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Other'];
      return res.json({ categories: fallbackCategories });
    }

    const db = admin.firestore();
    const snapshot = await db.collection('questionTemplates').where('isActive', '==', true).get();

    const categoriesSet = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach(category => categoriesSet.add(category));
      }
    });

    const categories = Array.from(categoriesSet).sort();
    res.json({ categories });

  } catch (error) {
    console.error('Error fetching categories:', error);
    const fallbackCategories = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Other'];
    res.json({ categories: fallbackCategories }); // Return fallback categories instead of error
  }
});

module.exports = router;

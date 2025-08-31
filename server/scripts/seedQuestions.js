require('dotenv').config();
const { initializeFirebase } = require('../config/firebase');

const sampleQuestions = [
  // Technology Category
  {
    question: "What is the primary programming language used?",
    type: "select",
    required: true,
    options: ["JavaScript", "Python", "Java", "C#", "Go", "Rust", "TypeScript", "PHP", "Ruby", "Other"],
    categories: ["Technology", "Software"],
    order: 1,
    helpText: "Select the main programming language for this product",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Is this product cloud-based?",
    type: "boolean",
    required: true,
    options: [],
    categories: ["Technology", "Software"],
    order: 2,
    helpText: "Indicate if the product runs in the cloud",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Which cloud platforms do you support?",
    type: "multiselect",
    required: false,
    options: ["AWS", "Azure", "Google Cloud", "Digital Ocean", "Heroku", "Vercel", "Netlify"],
    categories: ["Technology", "Software"],
    order: 3,
    helpText: "Select all supported cloud platforms",
    validationRules: {},
    conditionalLogic: {
      dependsOn: "is-cloud-based", // This would need to match the question ID
      condition: "equals",
      value: true,
      showWhen: true
    },
    isActive: true
  },
  {
    question: "What is the expected number of concurrent users?",
    type: "number",
    required: true,
    options: [],
    categories: ["Technology", "Software"],
    order: 4,
    helpText: "Estimate the maximum concurrent users",
    validationRules: {
      min: 1,
      max: 1000000
    },
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Describe the main features and functionality",
    type: "textarea",
    required: true,
    options: [],
    categories: ["Technology", "Software"],
    order: 5,
    helpText: "Provide a detailed description of key features",
    validationRules: {
      min: 50,
      max: 2000
    },
    conditionalLogic: null,
    isActive: true
  },

  // Healthcare Category
  {
    question: "Is this product FDA regulated?",
    type: "boolean",
    required: true,
    options: [],
    categories: ["Healthcare", "Medical"],
    order: 1,
    helpText: "Indicate if FDA approval is required",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What FDA class is this device?",
    type: "select",
    required: true,
    options: ["Class I", "Class II", "Class III", "Not Applicable"],
    categories: ["Healthcare", "Medical"],
    order: 2,
    helpText: "Select the appropriate FDA device class",
    validationRules: {},
    conditionalLogic: {
      dependsOn: "fda-regulated",
      condition: "equals",
      value: true,
      showWhen: true
    },
    isActive: true
  },
  {
    question: "Does this product handle PHI (Protected Health Information)?",
    type: "boolean",
    required: true,
    options: [],
    categories: ["Healthcare", "Medical"],
    order: 3,
    helpText: "Indicate if the product processes patient data",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Which compliance standards does this product meet?",
    type: "multiselect",
    required: false,
    options: ["HIPAA", "HITECH", "SOC 2", "ISO 27001", "FDA 21 CFR Part 11", "GDPR"],
    categories: ["Healthcare", "Medical"],
    order: 4,
    helpText: "Select all applicable compliance standards",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

  // Manufacturing Category
  {
    question: "What type of manufacturing process is used?",
    type: "select",
    required: true,
    options: ["Injection Molding", "3D Printing", "CNC Machining", "Assembly", "Chemical Processing", "Other"],
    categories: ["Manufacturing", "Industrial"],
    order: 1,
    helpText: "Select the primary manufacturing method",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What is the expected production volume per month?",
    type: "number",
    required: true,
    options: [],
    categories: ["Manufacturing", "Industrial"],
    order: 2,
    helpText: "Enter monthly production capacity",
    validationRules: {
      min: 1,
      max: 10000000
    },
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What materials are used in production?",
    type: "textarea",
    required: true,
    options: [],
    categories: ["Manufacturing", "Industrial"],
    order: 3,
    helpText: "List all materials and their specifications",
    validationRules: {
      min: 20,
      max: 1000
    },
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Are there any environmental considerations?",
    type: "textarea",
    required: false,
    options: [],
    categories: ["Manufacturing", "Industrial"],
    order: 4,
    helpText: "Describe environmental impact and mitigation measures",
    validationRules: {
      max: 1000
    },
    conditionalLogic: null,
    isActive: true
  },

  // Finance Category
  {
    question: "What is the target market for this financial product?",
    type: "select",
    required: true,
    options: ["Individual Consumers", "Small Business", "Enterprise", "Financial Institutions", "Government"],
    categories: ["Finance", "Financial Services"],
    order: 1,
    helpText: "Select the primary target market",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Which financial regulations apply?",
    type: "multiselect",
    required: true,
    options: ["SOX", "PCI DSS", "GDPR", "CCPA", "Basel III", "MiFID II", "Dodd-Frank"],
    categories: ["Finance", "Financial Services"],
    order: 2,
    helpText: "Select all applicable financial regulations",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What is the expected transaction volume per day?",
    type: "number",
    required: true,
    options: [],
    categories: ["Finance", "Financial Services"],
    order: 3,
    helpText: "Estimate daily transaction volume",
    validationRules: {
      min: 1,
      max: 10000000
    },
    conditionalLogic: null,
    isActive: true
  },

  // Retail Category
  {
    question: "What type of retail channel is this for?",
    type: "select",
    required: true,
    options: ["Online Only", "Physical Store", "Omnichannel", "Marketplace", "Direct to Consumer"],
    categories: ["Retail", "E-commerce"],
    order: 1,
    helpText: "Select the retail distribution model",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What is the target demographic?",
    type: "select",
    required: true,
    options: ["Children (0-12)", "Teenagers (13-17)", "Young Adults (18-34)", "Adults (35-54)", "Seniors (55+)", "All Ages"],
    categories: ["Retail", "E-commerce"],
    order: 2,
    helpText: "Select the primary target age group",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What is the expected shelf life?",
    type: "number",
    required: false,
    options: [],
    categories: ["Retail", "E-commerce"],
    order: 3,
    helpText: "Enter shelf life in days (if applicable)",
    validationRules: {
      min: 1,
      max: 36500
    },
    conditionalLogic: null,
    isActive: true
  }
];

async function seedQuestions() {
  try {
    console.log('Initializing Firebase...');
    const db = initializeFirebase();
    
    console.log('Seeding question templates...');
    
    for (const question of sampleQuestions) {
      const docRef = await db.collection('questionTemplates').add({
        ...question,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      });
      console.log(`Added question: ${question.question} (ID: ${docRef.id})`);
    }
    
    console.log(`Successfully seeded ${sampleQuestions.length} question templates!`);
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
}

// Run the seed script
seedQuestions();

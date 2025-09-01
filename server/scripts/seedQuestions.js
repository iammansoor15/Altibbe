require('dotenv').config();
const { initializeFirebase } = require('../config/firebase');

const sampleQuestions = [
  // Electronics & Gadgets Category
  {
    question: "What is the screen size of this device?",
    type: "select",
    required: false,
    options: ["Under 5 inches", "5-6 inches", "6-7 inches", "7-8 inches", "8-10 inches", "10+ inches"],
    categories: ["Electronics & Gadgets"],
    order: 1,
    helpText: "Select the screen size range",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What is the storage capacity?",
    type: "select",
    required: false,
    options: ["Under 32GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB+", "Expandable"],
    categories: ["Electronics & Gadgets"],
    order: 2,
    helpText: "Select the storage capacity",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Does this device support 5G connectivity?",
    type: "boolean",
    required: false,
    options: [],
    categories: ["Electronics & Gadgets"],
    order: 3,
    helpText: "Indicate if the device supports 5G networks",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

  // Fashion & Clothing Category
  {
    question: "What is the target gender for this clothing item?",
    type: "select",
    required: false,
    options: ["Men", "Women", "Unisex", "Kids", "Boys", "Girls"],
    categories: ["Fashion & Clothing"],
    order: 1,
    helpText: "Select the intended gender",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What is the clothing size range available?",
    type: "multiselect",
    required: false,
    options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Plus Size"],
    categories: ["Fashion & Clothing"],
    order: 2,
    helpText: "Select all available sizes",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Is this item machine washable?",
    type: "boolean",
    required: false,
    options: [],
    categories: ["Fashion & Clothing"],
    order: 3,
    helpText: "Indicate if the item can be machine washed",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

  // Home & Kitchen Category
  {
    question: "What room is this item primarily used in?",
    type: "select",
    required: false,
    options: ["Kitchen", "Living Room", "Bedroom", "Bathroom", "Dining Room", "Office", "Outdoor"],
    categories: ["Home & Kitchen"],
    order: 1,
    helpText: "Select the primary room for use",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What materials are used in construction?",
    type: "multiselect",
    required: false,
    options: ["Wood", "Metal", "Plastic", "Glass", "Fabric", "Ceramic", "Bamboo", "Recycled Materials"],
    categories: ["Home & Kitchen"],
    order: 2,
    helpText: "Select all materials used",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

  // Beauty & Personal Care Category
  {
    question: "What skin type is this product suitable for?",
    type: "multiselect",
    required: false,
    options: ["Dry Skin", "Oily Skin", "Combination Skin", "Sensitive Skin", "Normal Skin", "Mature Skin"],
    categories: ["Beauty & Personal Care"],
    order: 1,
    helpText: "Select suitable skin types",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Are there any known allergens in this product?",
    type: "multiselect",
    required: false,
    options: ["Paraben-free", "Sulfate-free", "Cruelty-free", "Vegan", "Organic", "Hypoallergenic"],
    categories: ["Beauty & Personal Care"],
    order: 2,
    helpText: "Select all applicable certifications",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

  // Sports & Fitness Category
  {
    question: "What fitness level is this product designed for?",
    type: "select",
    required: false,
    options: ["Beginner", "Intermediate", "Advanced", "All Levels"],
    categories: ["Sports & Fitness"],
    order: 1,
    helpText: "Select the appropriate fitness level",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Is this equipment foldable for storage?",
    type: "boolean",
    required: false,
    options: [],
    categories: ["Sports & Fitness"],
    order: 2,
    helpText: "Indicate if the equipment is foldable",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

  // Books & Stationery Category
  {
    question: "What genre or subject is this book?",
    type: "select",
    required: false,
    options: ["Fiction", "Non-Fiction", "Biography", "Self-Help", "Business", "Technology", "Children", "Education"],
    categories: ["Books & Stationery"],
    order: 1,
    helpText: "Select the book genre or subject",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Is this an e-book or physical book?",
    type: "select",
    required: false,
    options: ["Physical Book", "E-book", "Audiobook", "Both"],
    categories: ["Books & Stationery"],
    order: 2,
    helpText: "Select the book format",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

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
  },

  // Home & Garden Category
  {
    question: "What type of home product is this?",
    type: "select",
    required: true,
    options: ["Furniture", "Home Decor", "Kitchen Appliances", "Garden Tools", "Lighting", "Storage Solutions"],
    categories: ["Home & Garden"],
    order: 1,
    helpText: "Select the type of home product",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What materials are used in construction?",
    type: "multiselect",
    required: true,
    options: ["Wood", "Metal", "Plastic", "Glass", "Fabric", "Ceramic", "Stone", "Recycled Materials"],
    categories: ["Home & Garden"],
    order: 2,
    helpText: "Select all materials used in construction",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

  // Health & Beauty Category
  {
    question: "What type of health/beauty product is this?",
    type: "select",
    required: true,
    options: ["Skincare", "Makeup", "Hair Care", "Health Supplements", "Personal Care", "Medical Devices"],
    categories: ["Health & Beauty"],
    order: 1,
    helpText: "Select the type of health/beauty product",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Are there any allergens or sensitive ingredients?",
    type: "textarea",
    required: false,
    options: [],
    categories: ["Health & Beauty"],
    order: 2,
    helpText: "List any allergens or ingredients that may cause sensitivity",
    validationRules: {
      max: 500
    },
    conditionalLogic: null,
    isActive: true
  },

  // Automotive Category
  {
    question: "What type of automotive product is this?",
    type: "select",
    required: true,
    options: ["Car Parts", "Motorcycle Parts", "Car Accessories", "Tools", "Maintenance Products"],
    categories: ["Automotive"],
    order: 1,
    helpText: "Select the type of automotive product",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What vehicle types is this compatible with?",
    type: "multiselect",
    required: false,
    options: ["Sedan", "SUV", "Truck", "Motorcycle", "Electric Vehicle", "Hybrid", "All Vehicles"],
    categories: ["Automotive"],
    order: 2,
    helpText: "Select compatible vehicle types",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

  // Food & Beverages Category
  {
    question: "What type of food/beverage product is this?",
    type: "select",
    required: true,
    options: ["Packaged Food", "Beverages", "Supplements", "Organic Products", "Specialty Foods"],
    categories: ["Food & Beverages"],
    order: 1,
    helpText: "Select the type of food/beverage product",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "Are there any allergens present?",
    type: "multiselect",
    required: true,
    options: ["Peanuts", "Tree Nuts", "Milk", "Eggs", "Fish", "Shellfish", "Soy", "Wheat", "Gluten"],
    categories: ["Food & Beverages"],
    order: 2,
    helpText: "Select all allergens present in the product",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

  // Sports & Outdoors Category
  {
    question: "What type of sports/outdoor product is this?",
    type: "select",
    required: true,
    options: ["Exercise Equipment", "Sporting Goods", "Outdoor Gear", "Bicycles", "Sports Apparel", "Camping Equipment"],
    categories: ["Sports & Outdoors"],
    order: 1,
    helpText: "Select the type of sports/outdoor product",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What is the intended use environment?",
    type: "multiselect",
    required: false,
    options: ["Indoor", "Outdoor", "Gym", "Home", "Professional", "Recreational"],
    categories: ["Sports & Outdoors"],
    order: 2,
    helpText: "Select intended use environments",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },

  // Services Category
  {
    question: "What type of service is this?",
    type: "select",
    required: true,
    options: ["Consulting", "Digital Marketing", "Web Development", "Design Services", "Professional Services", "Subscription Service"],
    categories: ["Services"],
    order: 1,
    helpText: "Select the type of service",
    validationRules: {},
    conditionalLogic: null,
    isActive: true
  },
  {
    question: "What is the service delivery method?",
    type: "select",
    required: false,
    options: ["In-person", "Remote", "Hybrid", "Online Platform", "Mobile App", "Software"],
    categories: ["Services"],
    order: 2,
    helpText: "Select the service delivery method",
    validationRules: {},
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

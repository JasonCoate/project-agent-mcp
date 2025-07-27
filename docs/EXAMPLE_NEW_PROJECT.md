# Example: Creating a New Project with Project Agent

This example shows how to use the Project Agent to start a new React e-commerce application.

## Prerequisites

- Project Agent installed and running (see [Project Setup Guide](PROJECT_SETUP_GUIDE.md))
- AI assistant configured with MCP server
- MCP server running in background

## Step-by-Step Example

### 1. Create Project Directory

```bash
# Create your project anywhere
mkdir ecommerce-store
cd ecommerce-store
```

### 2. Initialize with AI Assistant

In your AI assistant (Cursor, Claude, Trae), start a conversation:

```
User: "I want to create a new React e-commerce application called 'ecommerce-store'.
It should include:
- User authentication (login/signup)
- Product catalog with search and filtering
- Shopping cart functionality
- Stripe payment integration
- Admin dashboard for managing products
- Responsive design with Tailwind CSS

Please set up the project structure and specifications."
```

**AI Assistant:** "I'll create the authentication feature structure for you."

```
Using create_feature_directory tool...
Created feature directory: .specs/ecommerce-store/1-feat-authentication/
Files created: README.md, specs.md, tasks.md, tests.md

Using create_feature_workflow tool...
Feature workflow created: auth-workflow-001
Generated authentication tasks and specifications
```

### 3. AI Assistant Response

The AI will use MCP tools to:

```
🚀 About to create a new project

📋 Parameters:
   🏷️  Project Name: ecommerce-store
   📝 Description: React e-commerce application with authentication, catalog, cart, and payments
   📊 Status: planning

✅ Project created successfully!
📁 Generated specifications in .specs/
📋 Created 28 tasks across 5 phases
```

### 4. Generated Project Structure

After initialization, your directory will contain:

```
ecommerce-store/
├── .specs/
│   ├── README.md              # Project overview and workflow
│   ├── user-stories.md        # "As a customer, I want to..."
│   ├── architecture.md        # React + Node.js + Stripe + MongoDB
│   ├── implementation.md      # Component structure, API design
│   ├── testing-strategy.md    # Jest, Cypress, testing approach
│   ├── tasks.md              # Main project task breakdown
│   └── ecommerce-store/      # Project-specific feature directories
│       ├── 1-feat-authentication/
│       │   ├── README.md     # User auth feature overview
│       │   ├── tasks.md      # Login, signup, password reset tasks
│       │   ├── specs.md      # JWT implementation, security
│       │   └── tests.md      # Auth testing strategy
│       ├── 2-feat-product-catalog/
│       │   ├── README.md     # Product browsing feature
│       │   ├── tasks.md      # Search, filters, pagination
│       │   ├── specs.md      # Product data model, API
│       │   └── tests.md      # Catalog testing plan
│       ├── 3-feat-shopping-cart/
│       │   ├── README.md     # Cart management feature
│       │   ├── tasks.md      # Add/remove items, persistence
│       │   ├── specs.md      # Cart state, local storage
│       │   └── tests.md      # Cart functionality tests
│       ├── 4-feat-payment-system/
│       │   ├── README.md     # Stripe integration feature
│       │   ├── tasks.md      # Payment flow, webhooks
│       │   ├── specs.md      # Stripe API, security
│       │   └── tests.md      # Payment testing strategy
│       └── 5-feat-admin-dashboard/
│           ├── README.md     # Admin management feature
│           ├── tasks.md      # Product CRUD, analytics
│           ├── specs.md      # Admin permissions, UI
│           └── tests.md      # Admin functionality tests
└── [you create your React app files here]
```

### 5. Review Generated Specifications

#### User Stories (`.specs/user-stories.md`)

```markdown
# User Stories - E-commerce Store

## Customer Stories

- As a customer, I want to browse products by category
- As a customer, I want to search for specific products
- As a customer, I want to add items to my cart
- As a customer, I want to securely checkout with Stripe
- As a customer, I want to create an account and track orders

## Admin Stories

- As an admin, I want to add/edit/remove products
- As an admin, I want to view sales analytics
- As an admin, I want to manage customer orders
```

#### Architecture (`.specs/architecture.md`)

```markdown
# Technical Architecture

## Frontend

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v6

## Backend

- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Payments**: Stripe API

## Deployment

- **Frontend**: Vercel
- **Backend**: Railway/Heroku
- **Database**: MongoDB Atlas
```

#### Main Tasks (`.specs/tasks.md`)

```markdown
# Main Project Tasks - E-commerce Store

## Project Setup (4 tasks)

- [ ] Set up React project with TypeScript
- [ ] Configure Tailwind CSS and Redux
- [ ] Set up development environment
- [ ] Initialize Git repository and CI/CD

## Integration Tasks (3 tasks)

- [ ] Integrate all features into main app
- [ ] End-to-end testing across features
- [ ] Deploy to production
```

#### Feature-Specific Tasks

**Authentication Feature (`.specs/ecommerce-store/1-feat-authentication/tasks.md`)**

```markdown
# Authentication Feature Tasks

## UI Components (3 tasks)

- [ ] Design login/signup forms
- [ ] Create password reset flow
- [ ] Implement user profile page

## Backend Integration (4 tasks)

- [ ] Implement JWT authentication
- [ ] Create protected route wrapper
- [ ] Add session management
- [ ] Implement logout functionality

## Testing (2 tasks)

- [ ] Unit tests for auth components
- [ ] Integration tests for auth flow
```

**Product Catalog Feature (`.specs/ecommerce-store/2-feat-product-catalog/tasks.md`)**

```markdown
# Product Catalog Feature Tasks

## Product Display (4 tasks)

- [ ] Design product card components
- [ ] Implement product listing page
- [ ] Create product detail page
- [ ] Add product image gallery

## Search & Filtering (3 tasks)

- [ ] Add search functionality
- [ ] Create category filtering
- [ ] Implement sorting options

## Admin Management (3 tasks)

- [ ] Create admin product management
- [ ] Implement inventory tracking
- [ ] Add bulk product operations
```

**Shopping Cart Feature (`.specs/ecommerce-store/3-feat-shopping-cart/tasks.md`)**

```markdown
# Shopping Cart Feature Tasks

## Cart Management (3 tasks)

- [ ] Design cart UI components
- [ ] Implement cart state management
- [ ] Add cart persistence

## Checkout Process (4 tasks)

- [ ] Create checkout flow
- [ ] Integrate Stripe payment processing
- [ ] Add order confirmation
- [ ] Implement order history
```

### 6. Start Development

Now you can start building:

```bash
# Initialize your React app
npx create-react-app . --template typescript

# Install additional dependencies
npm install @reduxjs/toolkit react-redux react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 7. Track Progress with AI Assistant

As you complete tasks, update progress for specific features:

```
User: "I've completed the login/signup forms for the authentication feature"

AI: 🎉 Great progress on the authentication feature! Let me update your task status.

🔄 About to update feature task status

📋 Parameters:
   🏷️  Feature: authentication
   📋 Task: "Design login/signup forms"
   ✅ Status: Completed
   📝 Notes: "Created responsive forms with validation"

✅ Task updated successfully!
📄 Feature markdown file synchronized (.specs/ecommerce-store/1-feat-authentication/tasks.md)
💾 Database record updated

📈 Authentication Feature Progress:
   ✅ Completed: 1/9 tasks (11%)
   🔄 In Progress: 0 tasks
   ⏳ Remaining: 8 tasks

📈 Overall Project Progress:
   ✅ Completed: 3/35 total tasks (9%)
   🏗️  Features: 5 features in development
   🎯 Active Feature: authentication

🎯 Next recommended task: "Create password reset flow"
```

**You:** "Update the authentication login task as completed"

**AI Assistant:** "I'll update that task for you."

```
Using update_feature_task tool...
Task updated: "Implement login form validation" - Status: Completed
Feature: authentication
Markdown file updated: .specs/ecommerce-store/1-feat-authentication/tasks.md
```

### 8. Feature-Based Development

Work on features independently:

```
User: "I want to start working on the shopping cart feature while my teammate works on authentication"

AI: Perfect! Let me show you the shopping cart feature specifications.

📁 Loading feature context: shopping-cart

📋 Feature Overview:
   🛒 Shopping Cart Management
   📝 3 cart management tasks
   💳 4 checkout process tasks
   🧪 2 testing tasks

📄 Key Files:
   📖 .specs/ecommerce-store/3-feat-shopping-cart/README.md - Feature overview
📋 .specs/ecommerce-store/3-feat-shopping-cart/tasks.md - Task breakdown
📐 .specs/ecommerce-store/3-feat-shopping-cart/specs.md - Technical specifications
🧪 .specs/ecommerce-store/3-feat-shopping-cart/tests.md - Testing strategy

🎯 Recommended starting point: "Design cart UI components"

Would you like me to show you the detailed specifications for this feature?
```

### 9. Feature Checkpoints

At the completion of each feature:

```
User: "I've completed all authentication feature tasks. Ready for feature checkpoint."

AI: 🛑 Checkpoint: Authentication Feature Review

📊 Feature Progress: 9/9 tasks complete (100%)

🔍 Feature Validation:
   ✅ All feature tasks completed
   ✅ Unit tests passing
   ✅ Integration tests passing
   ✅ Code review completed
   ✅ Documentation updated
   ✅ Feature ready for integration

🎯 Status: Authentication feature complete!

📈 Project Status:
   ✅ Completed Features: 1/5 (20%)
   🔄 Active Features: 2 (product-catalog, shopping-cart)
   ⏳ Pending Features: 2 (payment-system, admin-dashboard)

🎯 Next milestone: Complete 2 more features for MVP release
```

**You:** "Create a checkpoint for the completed authentication feature"

**AI Assistant:** "I'll validate the authentication feature completion and create a checkpoint."

```
Using create_feature_checkpoint tool...
Analyzing authentication feature progress...
Progress: 8/8 tasks completed (100%)
Validation: All authentication requirements met
Checkpoint created: .specs/ecommerce-store/1-feat-authentication/checkpoint-1705123456789.md
Feature status: completed
```

### 10. Continuous Collaboration

Throughout development, the AI provides feature-specific guidance:

```
User: "I'm having trouble with the Stripe integration in the payment-system feature. Can you help?"

AI: I'll help you with Stripe integration! Let me check your payment-system feature specifications.

📁 Loading feature context: payment-system

📋 Feature Context Loaded:
   📖 .specs/ecommerce-store/4-feat-payment-system/README.md - Feature overview
📐 .specs/ecommerce-store/4-feat-payment-system/specs.md - Stripe API specifications
📋 .specs/ecommerce-store/4-feat-payment-system/tasks.md - Current task progress
   🏗️  .specs/architecture.md - Overall system architecture

🔍 Analysis:
   ✅ Stripe API keys configured
   ✅ Payment flow UI designed
   🔄 Currently working on: "Integrate Stripe payment processing"
   ⏳ Next task: "Add order confirmation"

Based on your payment-system feature specs, here's how to implement the Stripe checkout flow...

[Provides specific code examples based on your project's architecture and current progress]
```

**You:** "Show me the current status of all features"

**AI Assistant:** "Here's your project overview:"

```
Using list_project_features tool...
Loading project: react-ecommerce-app

Project Features:
- Authentication: 8/8 tasks complete (100%) ✅
- Product Catalog: 6/10 tasks complete (60%) 🔄
- Shopping Cart: 3/10 tasks complete (30%) 🔄
- Payment System: 0/8 tasks complete (0%) ⏳
- Admin Dashboard: 0/12 tasks complete (0%) ⏳

Next Priority: Complete product catalog search functionality
```

### 11. Cross-Feature Integration

When features need to work together:

```
User: "How do I integrate the shopping cart with the payment system?"

AI: Great question! Let me analyze the integration points between these features.

📁 Loading multi-feature context:
   🛒 shopping-cart feature specifications
   💳 payment-system feature specifications
   🏗️  Overall architecture requirements

🔗 Integration Analysis:
   📤 Cart exports: cart items, total amount, user session
   📥 Payment imports: order data, user authentication
   🔄 Shared state: Redux store structure
   📡 API endpoints: /api/cart → /api/checkout

💡 Recommended Integration Pattern:
   1. Cart passes order summary to checkout
   2. Payment system validates cart contents
   3. Stripe processes payment with cart total
   4. Success triggers cart clearing

[Provides specific implementation code for the integration]
```

## Key Benefits

### 🎯 **Structured Approach**

- Clear phases and milestones
- Detailed task breakdown
- Progress tracking

### 📋 **Living Documentation**

- Specifications evolve with your project
- Always up-to-date task lists
- Automatic progress sync

### 🤖 **AI Collaboration**

- Context-aware assistance
- Project-specific guidance
- Automated progress tracking

### 🔄 **Flexibility**

- Modify specs as requirements change
- Add custom tasks
- Adapt to your workflow

## Tips for Success

1. **Start with good requirements**: The better your initial description, the better the generated specs
2. **Review and customize**: Edit the generated specs to match your exact needs
3. **Update regularly**: Keep the AI informed of your progress
4. **Use checkpoints**: Validate completion before moving to next phase
5. **Leverage context**: The AI knows your project specs and can provide targeted help

This approach transforms project management from a chore into a collaborative, intelligent workflow that adapts to your needs!

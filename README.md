# 🎓 Certify - Digital Certificate Management Platform

A comprehensive platform for generating, managing, and verifying digital
certificates with customizable HTML templates, built with Deco + Cloudflare
Workers.

## ✨ Key Features

- **Custom HTML Templates**: Create unique certificates with HTML and CSS
- **Batch Processing**: Generate hundreds of certificates simultaneously via CSV
  upload
- **Online Verification**: Official verification system with unique URLs for
  each certificate
- **Class Management**: Organize projects by classes/groups (turmas)
- **Email Campaigns**: Integrated system for automatic certificate distribution
- **PDF & PNG Export**: Generate certificates in multiple formats using API2PDF
- **Responsive Interface**: Modern, adaptive design for all devices

## 🚀 How It Works

### 1. **Create a Class (Turma)**

- Access the "Classes" section and create a new class for your project
- Add description and organize your certificate projects

### 2. **Upload HTML Template**

- Upload an HTML file with placeholders like `{{name}}`, `{{email}}`, etc.
- The system will automatically replace placeholders with student data
- Preview and customize your certificate design

### 3. **Upload CSV Data**

- Upload a CSV file with student information
- Specify which columns contain names, emails, and other data
- Map CSV columns to template placeholders

### 4. **Create Certificate Run**

- Execute batch generation by creating a "run"
- The system creates unique certificates for each student
- Track progress and status of certificate generation

### 5. **Online Verification & Distribution**

- Each certificate receives a unique verification URL
- Certificates can be shared and verified online
- Send certificates via email campaigns

## 📋 Project Structure

```
certify/
├── server/                 # Deco MCP Server + Cloudflare Workers
│   ├── tools/             # Domain-organized MCP tools
│   │   ├── certificados.ts # Certificate management tools
│   │   ├── templates.ts    # Template management tools
│   │   ├── csvs.ts        # CSV processing tools
│   │   ├── runs.ts        # Batch generation tools
│   │   └── todos.ts       # Class/turma management tools
│   ├── schema.ts          # SQLite database schema (Drizzle ORM)
│   ├── main.ts           # Main server entry point
│   └── workflows/        # Automated workflows
├── view/                 # React Frontend + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── routes/       # TanStack Router routes
│   │   ├── hooks/        # TanStack Query hooks for RPC
│   │   └── lib/          # RPC client and utilities
│   └── public/           # Static assets
└── package.json          # Workspace configuration
```

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, TanStack Router, TanStack
  Query
- **Backend**: Deco MCP Server, Cloudflare Workers, Drizzle ORM
- **Database**: SQLite (Cloudflare Durable Objects)
- **UI Components**: shadcn/ui, Lucide React icons
- **Certificate Generation**: API2PDF for PDF/PNG conversion
- **Deployment**: Cloudflare Workers

## 📊 Database Schema

The application uses a comprehensive database schema with the following
entities:

- **Turmas** (Classes): Organize certificate projects
- **Templates**: Store HTML certificate templates with placeholders
- **CSVs**: Manage uploaded student data
- **Runs**: Track batch certificate generation processes
- **Certificados**: Individual certificate records with verification URLs
- **Campanhas Email**: Email campaign management
- **Logs Email**: Email delivery tracking

## 🔐 Certificate Verification

Each certificate includes:

- **Unique ID**: Cryptographically secure identifier
- **Verification URL**: Public endpoint for authenticity validation
- **Timestamp Tracking**: Record when certificates are verified
- **Online Validation**: Real-time verification system

## 📧 Email System

- **Campaign Management**: Create and manage email campaigns
- **Template Customization**: Configure subject, body, and signatures
- **Batch Sending**: Automated mass email distribution
- **Delivery Tracking**: Monitor email delivery status and failures

## 🚀 Development

### Available Commands

- `npm run dev` - Start development environment (frontend + backend)
- `npm run gen` - Generate types for Deco integrations
- `npm run gen:self` - Generate types for your own tools/workflows
- `npm run deploy` - Deploy to production (Cloudflare Workers)
- `npm run db:generate` - Generate database migration files

### Development Workflow

1. **Start Development**: Run `npm run dev` to start both frontend and backend
2. **Add New Features**: Create tools in `server/tools/` organized by domain
3. **Generate Types**: Use `npm run gen:self` after adding new tools
4. **Frontend Integration**: Create TanStack Query hooks in `view/src/hooks/`
5. **Deploy**: Use `npm run deploy` for production deployment

### Domain Architecture

The project follows domain-based organization:

- **Certificados**: Certificate generation and management
- **Templates**: HTML template management and processing
- **CSVs**: Data import and processing
- **Runs**: Batch processing and workflow management
- **Turmas**: Class/project organization
- **Users**: Authentication and user management

## 🌐 Deployment

The application is deployed on Cloudflare Workers:

- **Serverless Backend**: Deco MCP server with automatic scaling
- **Edge Distribution**: Global CDN for fast certificate access
- **Durable Objects**: Persistent SQLite database storage
- **Static Assets**: Frontend served via Cloudflare Workers

## 📱 Responsive Design

Fully responsive interface optimized for:

- **Desktop**: Complete feature set with advanced management tools
- **Tablet**: Adapted layout for medium screens
- **Mobile**: Optimized interface for certificate viewing and basic management

## 🔧 Configuration

The application requires:

- **API2PDF API Key**: For PDF/PNG certificate generation
- **Deco Platform**: Integration with Deco ecosystem
- **Cloudflare Workers**: Hosting and database infrastructure

## 📝 License

This project is developed for educational and professional certificate management.

---

**Certify** - Transforming how you generate and manage digital certificates!
🎓✨

_Built with ❤️ for education and professional development_

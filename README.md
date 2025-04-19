# AI Scrum Master

An intelligent project management assistant that helps teams manage their Scrum processes more effectively.

## Features

- 🤖 AI-powered Scrum Master bot
- 🔄 Real-time project updates
- 📊 Sprint planning and tracking
- 👥 Team management
- 📝 Meeting notes and action items
- 🔍 Semantic search for past conversations
- 🔌 Extensible integration system

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, TailwindCSS
- **AI/ML**: LangChain, OpenAI
- **Vector Database**: LanceDB
- **Build System**: Turborepo
- **Testing**: Jest

## Prerequisites

- Node.js (v18 or higher)
- Yarn (v1.22 or higher)
- OpenAI API key

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-scrum-master.git
   cd ai-scrum-master
   ```

2. Install dependencies:
   ```bash
   yarn setup
   ```

3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development servers:
   ```bash
   yarn dev
   ```

   This will start:
   - Backend server on http://localhost:3001
   - Frontend development server on http://localhost:3000

## Project Structure

```
ai-scrum-master/
├── frontend/               # React frontend application
├── src/                    # Backend source code
│   ├── bot/               # Bot implementation
│   ├── config/            # Configuration files
│   ├── integrations/      # Integration implementations
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── tests/                 # Test files
├── turbo.json            # Turborepo configuration
└── package.json           # Project configuration
```

## Core Components

### Bot Implementation
- AI-powered conversation handling
- Context-aware responses
- Semantic search for past conversations
- Integration with project management tools

### Integration System
- Modular integration architecture
- Support for multiple service providers
- Standardized event handling
- Extensible adapter pattern

### Vector Database
- Semantic search capabilities
- Conversation history storage
- Efficient similarity matching
- Context preservation

### Build System
- Turborepo for monorepo management
- Parallel task execution
- Caching for faster builds
- Workspace dependencies management

## Available Scripts

- `yarn setup` - Install all dependencies
- `yarn dev` - Start development servers (using Turborepo)
- `yarn build` - Build the project (using Turborepo)
- `yarn start` - Start production servers
- `yarn test` - Run tests (using Turborepo)
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage
- `yarn lint` - Run linter

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 
# Contributing to code-drive

We love contributions! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/<your-org>/code-drive.git
cd code-drive
npm install
npm run dev -- --help
```

## Pull Request Process

1. Ensure your code follows the project's code-driven principles
2. Add or update tests as needed
3. Run `npm test` and ensure all tests pass
4. Run `npm run lint` to check for linting issues
5. Update README.md if adding new commands or changing behavior

## Code Style

- TypeScript with strict mode
- Single quotes, semicolons required
- 100 char line width
- Use `Prettier` for formatting (`npm run format`)

## Reporting Issues

- Search existing issues before filing
- Include reproduction steps and environment info
- Label appropriately (bug, feature, documentation)

# Agent Development Guide

## Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Lint/Format Commands

- `npm run lint` - Check code style and linting
- `npm run format` - Format code with Prettier
- `npm run check` - Run TypeScript type checking

## Test Commands

- No specific test framework configured
- Run individual test files with `bun test [file]` or `node [file]`

## Code Style Guidelines

- Use tabs for indentation (Prettier config)
- Single quotes for strings
- No trailing commas
- Print width: 100 characters
- Strict TypeScript with `strict: true`

## Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for components and classes
- Use UPPER_CASE for constants

## Import Organization

- Relative imports for local files
- No specific import grouping rules defined
- Use TypeScript path aliases where configured

## Error Handling

- Handle errors at the appropriate level
- Use TypeScript for compile-time error checking
- No specific error handling patterns enforced

## Framework Specifics

- Svelte 5+ with runes syntax
- Tailwind CSS for styling
- Vite for build tooling
- Cloudflare adapter for deployment

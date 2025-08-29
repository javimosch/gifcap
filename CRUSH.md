# CRUSH.md - GifCap Development Guidelines

## Build Commands
- `npm run build` - Package the CLI tool for distribution using pkg

## Lint/Test Commands
- No specific lint or test commands configured in package.json
- Project relies on runtime validation through FFmpeg

## Code Style Guidelines

### Imports
- Use CommonJS require syntax
- Group imports logically (external libraries, built-in Node.js modules)

### Formatting
- Use 2-space indentation
- Avoid unnecessary comments
- Follow existing spacing conventions around CLI output formatting

### Types
- No TypeScript; plain JavaScript with implicit typing
- Use JSDoc for function documentation when needed

### Naming Conventions
- camelCase for variables and functions
- UPPER_CASE for constants
- Descriptive variable names (e.g., recordingProcess, screenResolution)

### Error Handling
- Use try/catch blocks for async operations
- Exit with process.exit(1) for critical errors
- Provide clear error messages to users

### CLI Framework
- Use yargs for command line argument parsing
- Follow existing option structure and help formatting
- Commands should be implemented as separate functions
- Use yargs.command() to define new CLI commands

### FFmpeg Integration
- Use execa for running FFmpeg commands
- Always validate FFmpeg output and handle errors gracefully
- Structure FFmpeg arguments as arrays for readability

### Special Considerations
- Preserve colorful CLI output using ANSI escape codes
- Handle SIGINT for graceful recording termination
- Use getLastArg helper for array argument handling
- Maintain aspect ratio by default in video processing
# Yargs Cheatsheet

This document summarizes the key learnings about `yargs` while fixing a bug in `gifcap`.

## Key Concepts

*   **Commands:** `yargs` is designed to work with commands. You can define commands using the `.command()` method. This is the recommended way to structure a CLI tool with different functionalities.

*   **Default Command:** You can define a default command that runs when no other command is specified. This is done by using `.$0` as the command name.

*   **Options:** You can define options for your commands using the `.option()` method. Options can have aliases, types, descriptions, and default values.

*   **Handlers:** Each command has a handler function that is executed when the command is run. The handler function receives the parsed `argv` object as an argument.

*   **`argv`:** The `argv` object contains the parsed command-line arguments. It's important to let `yargs` manage the `argv` object and not try to access it before it's been parsed.

## Common Mistakes

*   **Manual Control Flow:** Avoid trying to manually control the program flow based on `argv._`. Let `yargs` handle the command parsing and execution.

*   **Accessing `argv` too early:** Don't try to access `argv` before `yargs` has finished parsing the arguments. This can lead to unexpected errors.

*   **Incorrectly Chaining Methods:** Make sure to chain the `yargs` methods in the correct order. The `.argv` getter should be at the end of the chain.

## Example

Here is an example of how to use `yargs` to create a simple CLI tool with a default command and an `inspect` command:

```javascript
#!/usr/bin/env node
const yargs = require('yargs');

yargs(process.argv.slice(2))
  .command('$0', 'the default command', () => {},
    async (argv) => {
      // Your default command logic here
    })
  .command('inspect <file>', 'Inspect a video file', (yargs) => {
    yargs.positional('file', {
      describe: 'Path to the video file to inspect',
      type: 'string'
    });
  }, async (argv) => {
    // Your inspect command logic here
  })
  .help('help')
  .alias('help', 'h')
  .argv;
```

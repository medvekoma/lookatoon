# look@toon - VS Code TOON viewer

A VS Code extension that renders [`.toon` files](https://github.com/toon-format/spec) as interactive tables instead of raw text.

## Features

- Displays each TOON table section as a formatted HTML table
- Displays top-level scalar values as a properties table
- Right-aligns numeric and formatted-number columns (e.g. `3.3M`, `77.7K`)
- Renders `null` values as muted italic `null`
- Handles all valid TOON value types: strings, numbers, booleans, null
- Adapts to your VS Code color theme (light, dark, high-contrast)
- Shows a clear error message when a file cannot be parsed

Here's how a `.toon` file looks when opened in VS Code:

![look@toon rendering a .toon file](example.png)

## Usage

Open any `.toon` file — the table view activates automatically.

To switch back to the raw text editor: right-click the tab → **Reopen Editor With…** → select the default text editor.

## Build & Install

```bash
npm install
npm run package
code --install-extension lookatoon-0.1.0.vsix
```

## Requirements

VS Code 1.74 or later.

## License

MIT

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

## Example

Here's a sample `.toon` file:

```text
Author: John Doe
Revision: 1.0
Properties:
  year: 2026
  month: 6
Country[4]{code,name,population,capital,capital_population}:
  JP,Japan,125.8M,Tokyo,37.4M
  US,United States,331M,Washington D.C.,0.7M
  DE,Germany,83.1M,Berlin,3.7M
  FR,France,67.2M,Paris,2.1M
```

How it looks in look@toon:

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

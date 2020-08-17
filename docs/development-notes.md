# development-notes


## Build/Package

- https://vscode-docs.readthedocs.io/en/latest/tools/vscecli/

```
npm install -g vsce
```

Packaging:
```
npm run compile

vsce package --baseContentUrl https://none --baseImagesUrl https://none

Executing prepublish script 'npm run vscode:prepublish'...

> ludown-extension@0.0.1 vscode:prepublish /Users/../ludown-extension
> npm run compile

> ludown-extension@0.0.1 compile /Users/../ludown-extension
> tsc -p ./

DONE  Packaged: /Users/../ludown-extension/ludown-extension-0.0.1.vsix (20 files, 13.98KB)
```

## Installation

[Install from a VSIX](https://code.visualstudio.com/docs/editor/extension-gallery)

You can manually install a VS Code extension packaged in a . vsix file. Using the Install from VSIX command in the Extensions view command drop-down, or the Extensions: Install from VSIX command in the Command Palette, point to the . vsix file.

## Debugging

[debugging-extensions](https://vscode.readthedocs.io/en/latest/extensions/debugging-extensions/)
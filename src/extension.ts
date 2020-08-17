/*---------------------------------------------------------
 'Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import Model from './Model';
import Sample, { textToSampleData } from './Sample';

const path = require("path");

const folderPath = vscode.workspace.rootPath; // get the open folder path
const configModulePath = path.resolve(folderPath, 'ludown-extension-config.js');
console.log(`configModulePath: ${configModulePath}`);
let model: Model = new Model();
let entities: string[];

async function loadModel() {
  model.loadConfigModule(configModulePath)
  .then(() => {
    console.log('config module loaded.');
    model.initGenerators();
    entities = model.getEntities();
    // console.log(`loadModel: entities:`, entities);
  })
  .catch((error) => {
    console.log(error);
  });
}

loadModel();

export function activate(context: vscode.ExtensionContext) {
  console.log(`ludown: activate`);

  let provider1 = vscode.languages.registerCompletionItemProvider('ludown', {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

      // a simple completion item which inserts `Hello World!`
      const simpleCompletion = new vscode.CompletionItem('Hello World!');

      // a completion item that inserts its text as snippet,
      // the `insertText`-property is a `SnippetString` which will be
      // honored by the editor.
      const snippetCompletion = new vscode.CompletionItem('Good part of the day');
      snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
      snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

      // a completion item that can be accepted by a commit character,
      // the `commitCharacters`-property is set which means that the completion will
      // be inserted and then the character will be typed.
      const commitCharacterCompletion = new vscode.CompletionItem('console');
      commitCharacterCompletion.commitCharacters = ['.'];
      commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

      // a completion item that retriggers IntelliSense when being accepted,
      // the `command`-property is set which the editor will execute after 
      // completion has been inserted. Also, the `insertText` is set so that 
      // a space is inserted after `new`
      const commandCompletion = new vscode.CompletionItem('new');
      commandCompletion.kind = vscode.CompletionItemKind.Keyword;
      commandCompletion.insertText = 'new ';
      commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

      // return all completion items as array
      return [
        simpleCompletion,
        snippetCompletion,
        commitCharacterCompletion,
        commandCompletion
      ];
    }
  });

  const provider2 = vscode.languages.registerCompletionItemProvider(
    'ludown',
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

        // get all text until the `position` and check if it reads `console.`
        // and if so then complete if `log`, `warn`, and `error`
        let linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.endsWith('console.')) {
          return undefined;
        }

        return [
          new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
          new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
          new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
        ];
      }
    },
    '.' // triggered whenever a '.' is being typed
  );

  const provider3 = vscode.languages.registerCompletionItemProvider(
    'ludown',
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        return [
          new vscode.CompletionItem('@entity=literal', vscode.CompletionItemKind.Method),
        ];
      }
    },
    '{' // triggered whenever a '{' is being typed
  );

  let provider4 = vscode.languages.registerCompletionItemProvider('ludown',
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
        console.log('Entity Completion.')
        let completions: any = [];
        entities.forEach((entity) => {
          const item = new vscode.CompletionItem(entity);
          item.commitCharacters = ['='];
          // item.insertText = new vscode.SnippetString(`${entity}=literal`);
          completions.push(item);
        });
        return completions;
      }
    });

  let expandSample = vscode.commands.registerCommand('extension.expandSample', async () => {
    // Display a message box to the user
    // vscode.window.showInformationMessage('Hello World!');

    const target = await vscode.window.showQuickPick(
      [
        { label: '10', description: 'Generate 10 samples', target: 10 },
        { label: '20', description: 'Generate 20 samples', target: 20 },
        { label: '100', description: 'Generate 100 samples', target: 100 },
        { label: '500', description: 'Generate 500 samples', target: 500 },
        { label: '1000', description: 'Generate 1000 samples', target: 1000 }
      ],
      { placeHolder: 'Generate how many samples?' });
    let count = 10;
    if (target) {
      count = target.target;
    }

    let editor = vscode.window.activeTextEditor;

    if (editor) {
      let document = editor.document;
      let selection = editor.selection;
      let start = selection.start
      const line = document.lineAt(start.line);
      let parsedText = textToSampleData(line.text.substring(1));
      let sourceSample = new Sample();
      sourceSample.elements = parsedText.sampleElements;
      let textToInsert = '\n\n';
      const generatedSamplesMap: any = {};
      if (model) {
        for (let i = 0; i < count; i++) {
          let generatedSampleData = model.generateVariationWithSampleData(sourceSample.data);
          let sample = new Sample(generatedSampleData);
          sample.generated = true;
          const generatedText = sample.toString(true);
          generatedSamplesMap[generatedText] = true;
        }
        const generatedSamples: string[] = Object.keys(generatedSamplesMap).sort();
        textToInsert += `> generated ${generatedSamples.length} unique samples:\n`;
        generatedSamples.forEach((generatedSample: string) => {
          textToInsert += `- ${generatedSample}\n`;
        })
        if (editor) {
          const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
          editor.edit(editBuilder => {
            if (editor) {
              editor.selections.forEach(sel => {
                const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
                // editBuilder.replace(range, textToInsert);
                const position = new vscode.Position(lastLine.lineNumber + 1, 0);
                editBuilder.insert(position, textToInsert);
              });
            }
          });
        }
      }
    }
  });

  let reloadModel = vscode.commands.registerCommand('extension.reloadModel', async () => {
    loadModel()
      .then (() => {
        vscode.window.showInformationMessage('Model reloaded.');
      })
      .catch((error) => {
        vscode.window.showInformationMessage('Error reloading model.');
        console.log(error);
      });
  });

  let hover = vscode.languages.registerHoverProvider('ludown', {
    provideHover(document, position, token) {
      let line = document.lineAt(position).text;
      let hoverText = '';
      if (line[0] === '-') {
        let parsedText = textToSampleData(line.substring(1));
        let sample = new Sample();
        sample.elements = parsedText.sampleElements;
        hoverText = sample.toString(false);
      }
      return {
        contents: [hoverText]
      };
    }
  });

  context.subscriptions.push(provider1, provider2, provider3, provider4, expandSample, reloadModel, hover);
}

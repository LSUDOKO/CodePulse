import * as vscode from 'vscode';
import io from 'socket.io-client';

const BRIDGE_URL = 'http://localhost:3000';
let socket: any;

interface PulseState {
  strictness: number;
  activePersona: string | null;
  history: any[];
  isStreaming: boolean;
  personas: any;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('[CodePulse Pro] Activating Real-time Engine...');

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = "$(loading~spin) CodePulse: Initializing";
  statusBar.show();

  try {
    // For socket.io-client v4, io is often the default export
    socket = io(BRIDGE_URL);

    socket.on('connect', () => {
      statusBar.text = "$(plug) CodePulse: Live";
    });

    socket.on('disconnect', () => {
      statusBar.text = "$(circle-slash) CodePulse: Offline";
    });

    socket.on('stateUpdate', (state: PulseState) => {
      statusBar.text = `$(circuit-board) CodePulse: Lvl ${state.strictness}`;
      if (currentPanel) {
        currentPanel.webview.postMessage({ type: 'state', state });
      }
    });

    socket.on('streamChunk', (data: { chunk: string, full: string }) => {
      if (currentPanel) {
        currentPanel.webview.postMessage({ type: 'chunk', ...data });
      }
    });

    socket.on('streamEnd', (data: { result: string }) => {
      if (currentPanel) {
        currentPanel.webview.postMessage({ type: 'end', ...data });
      }
    });
  } catch (e) {
    console.error("Socket error", e);
  }

  let currentPanel: vscode.WebviewPanel | undefined;

  const openPanel = () => {
    if (currentPanel) {
      currentPanel.reveal(vscode.ViewColumn.Two);
    } else {
      currentPanel = vscode.window.createWebviewPanel(
        'codepulsePro', '⚡ CodePulse PRO', vscode.ViewColumn.Two,
        { enableScripts: true, retainContextWhenHidden: true }
      );
      currentPanel.webview.html = getProWebviewContent();
      currentPanel.onDidDispose(() => { currentPanel = undefined; });
    }
  };

  const reviewCommand = vscode.commands.registerCommand('codepulse.reviewSelection', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const code = editor.document.getText(editor.selection) || editor.document.getText();

    openPanel();

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "CodePulse PRO: Analyzing...",
        cancellable: false
      }, async () => {
        const res = await fetch(`${BRIDGE_URL}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ persona: 'explain', code })
        });
        if (!res.ok) throw new Error("Bridge error");
      });
    } catch (e) {
      vscode.window.showErrorMessage("CodePulse Bridge offline!");
    }
  });

  context.subscriptions.push(statusBar, reviewCommand);
}

function getProWebviewContent() {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.1/marked.min.js"></script>
      <style>
        body { font-family: -apple-system, sans-serif; padding: 20px; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
        .cursor { display: inline-block; width: 8px; height: 1em; background: var(--vscode-focusBorder); margin-left: 2px; }
        pre { background: var(--vscode-textCodeBlock-background); padding: 12px; border-radius: 6px; overflow: auto; }
      </style>
    </head>
    <body>
      <div id="content"></div>
      <script>
        const content = document.getElementById('content');
        window.addEventListener('message', event => {
          const msg = event.data;
          if (msg.full || msg.result) {
            content.innerHTML = marked.parse(msg.full || msg.result) + (msg.type === 'chunk' ? '<span class="cursor"></span>' : '');
            window.scrollTo(0, document.body.scrollHeight);
          }
        });
      </script>
    </body>
    </html>`;
}

export function deactivate() {
  if (socket) socket.disconnect();
}

const vscode = require('vscode');
const path = require("path");
const util = require("./util");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	console.log('"js-sequence-diagrams" extension is now active!');
	let previewPanel = null;
	let panel = null;
	const editor = vscode.window.activeTextEditor;
	const mainStyle = await util.getCssStyles(context, 'preview.css')
	const handFontStyle = await util.getCssStyles(context, 'handFont.css')
	
	
	context.subscriptions.push(
		vscode.commands.registerCommand( util.command.grammar, () => {

			if (!panel) {
				panel = util.createWebview('js-sequence-diagram-grammar', {
					viewColumn: vscode.ViewColumn.Two,
					preserveFocus: true,
				},{
					retainContextWhenHidden: true,
				});
				panel.webview.html = getGrammar(context, panel);
				panel.onDidDispose(()=>{
					panel = null;
				})
			} else {
				panel.reveal(vscode.ViewColumn.Two)
			}
		})

	);

	context.subscriptions.push(
		vscode.commands.registerCommand(util.command.preview, () => {

			if (!previewPanel) {
				previewPanel = util.createWebview('js-sequence-diagram-preview', {
					viewColumn: vscode.ViewColumn.Two,
					preserveFocus: true,
				},{
					enableScripts: true,
					retainContextWhenHidden: true,
					localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
				});

				previewPanel.onDidChangeViewState(() => {
					if (previewPanel.visible) {
						update(context, previewPanel, mainStyle, handFontStyle)
					}
				});

				previewPanel.webview.onDidReceiveMessage((message)=>{
					switch (message.type){
						case "ready":
							console.log("webview ready")
							console.log(message.text)
							vscode.window.showErrorMessage(message.text)
							update(context, previewPanel, mainStyle, handFontStyle)
						break;

						case "parseError":
							vscode.window.showErrorMessage(message.text)
						break;

						case "download":
							var fileData = decodeURIComponent(message.text);
							const uri = editor.document.uri;
							util.download(uri, fileData.toString());
						break;
					}
				})
				
				previewPanel.onDidDispose(() => {
					previewPanel = null;
				});
			} else {
				previewPanel.reveal(vscode.ViewColumn.Two)
			}

		})

	);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

const update = async (context, previewPanel, mainStyle, handFontStyle) => {
	const editor = vscode.window.activeTextEditor;
	const styleConfig = util.config();
	const rootStyle = `:root {
					--simple-color: ${styleConfig.foregroundColor};
					--hand-color: ${styleConfig.foregroundColor}; 
					background-color: ${styleConfig.backgroundColor};
				}`
	const styles = { rootStyle, mainStyle, handFontStyle }
	const theme = styleConfig.theme

	if (editor) {
		let document = editor.document;
		let sequenceText = document.getText();

		previewPanel.webview.html = null;
		previewPanel.webview.html = getPreview(context, previewPanel, styles);
		
		previewPanel.webview.postMessage({
			"type": "preview",
			"text": sequenceText,
			styles,
			theme
		})
	} 
}

function getGrammar(context, { webview }) {
	const grammarImg = "https://bramp.github.io/js-sequence-diagrams/images/grammar.png"
	const styleUri = util.getWebviewSrc(webview, context, 'grammar.css')

	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta http-equiv="Content-Security-Policy" img-src ${webview.cspSource} https:; style-src ${webview.cspSource};" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>js-sequence-diagrams-grammar</title>
			<link rel="stylesheet" href="${styleUri}" />
		</head>
		<body>
			<img src="${grammarImg}" />
		</body>
		</html>
	`;
}

function getPreview(context, { webview }, styles) {
	const webfontUri = util.getWebviewSrc(webview, context, 'webfont.js')
	const snapSvgUri = util.getWebviewSrc(webview, context, 'snap.svg-min.js')
	const underscoreUri = util.getWebviewSrc(webview, context, 'underscore-min.js')
	const sequenceDiagramUri = util.getWebviewSrc(webview, context,'sequence-diagram-min.js')
	const mainUri = util.getWebviewSrc(webview, context,'main.js')
	const sequenceDiagramFontUri = util.getWebviewSrc(webview, context, 'sequence-diagram-min.css')

	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta http-equiv="Content-Security-Policy" script-src 'self' ${webview.cspSource}; style-src ${webview.cspSource};" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>js-sequence-diagrams-grammar</title>
			<link rel="stylesheet" href="${sequenceDiagramFontUri}" id="previewFont"/>
			<script src="${webfontUri}"></script>
			<script src="${snapSvgUri}"></script>
			<script src="${underscoreUri}"></script>
			<script src="${sequenceDiagramUri}"></script>
			<style>
				${styles.rootStyle}
				${styles.mainStyle}
			</style>
		</head>
		<body>
			<div id="diagram"></div>
			<a id="download" 
				class="monaco-button monaco-text-button" 
				tabindex="0" 
				role="button" 
				title="Save Image" 
				style="color: #FFF; background-color: rgb(14, 99, 156); padding:10px; user-select: none;"
			> Save Image </a>
		</body>
		<script src="${mainUri}"></script>
		</html>
	`;
}

module.exports = {
	activate,
	deactivate
}

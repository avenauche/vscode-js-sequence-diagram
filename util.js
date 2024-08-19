const vscode = require('vscode');
const path = require("path");
const command = {
    'grammar': "js-sequence-diagrams.grammar",
    'preview': "js-sequence-diagrams.preview",
}

const createWebview = (title = 'js-sequence-diagram', viewOptions = {}, webviewOptions = {}) => {
    const panel = vscode.window.createWebviewPanel(
        'js-sequence-diagram',
        title,
        viewOptions,
        webviewOptions
    );
    return panel;
}

const getWebviewSrc = (webview, context, filename) => {
    const filePath = vscode.Uri.file(
        path.join(context.extensionPath, 'media', filename)
    );
    return webview.asWebviewUri(filePath);
}


const getTheme = () => {
    return vscode.workspace.getConfiguration().get("styleConfig.theme")
}

const getBgColor = () => {
    return vscode.workspace.getConfiguration().get("styleConfig.background")
     
}

const getForegroundColor = () => {
    return vscode.workspace.getConfiguration().get("styleConfig.foreground")
}

const download = async (targetResource, svgString) => {
    const defaultUri = vscode.Uri.file(targetResource.fsPath + ".svg")
    const fileUri = await vscode.window.showSaveDialog({ defaultUri });
    if(fileUri){
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(svgString));
        vscode.window.showInformationMessage('File Saved');
    }
}


const getCssStyles = async (context, filename) => {
    const stylefilePath = vscode.Uri.file(path.join(context.extensionPath, 'media', filename));
    const styleFileUri = vscode.Uri.parse(stylefilePath)
    return await (await vscode.workspace.fs.readFile(styleFileUri)).toString()
}

const config = () => {

    return {
        "theme": getTheme(),
        "backgroundColor": getBgColor(),
        "foregroundColor": getForegroundColor()
    }
}

module.exports = {
    createWebview,
    getWebviewSrc,
    getCssStyles,
    config,
    download,
    command,
}
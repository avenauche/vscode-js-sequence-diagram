(function() {
    const vscode = acquireVsCodeApi();

    document.onload = function () { 
        console.log("document.onload")
        vscode.postMessage({
            type: 'ready',
            text: 'im ready'
        });
     };

    document.addEventListener("load", () => {
        console.log("document load event")
        vscode.postMessage({
            type: 'ready',
            text: 'im ready'
        });
    })

    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'preview':

            try {
                var sequenceText = message.text
                const { styles, theme } = message;

                var diagram = Diagram.parse(sequenceText);
                    diagram.drawSVG("diagram", { theme: theme });


                var diagramDownloadBtn = document.getElementById("download");
                    diagramDownloadBtn.addEventListener("click", async() => {
                        var svg = document.querySelector("#diagram>svg");
                        var classNames = svg.getAttribute("class");
                        var width = parseInt(svg.width.baseVal.value);
                        var height = parseInt(svg.height.baseVal.value);
                        var xml = `<?xml version="1.0" encoding="utf-8" standalone="no"?>
                            <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="${classNames}" width="${width}" height="${height}">
                                <source><![CDATA[]]></source>
                                <defs>
                                    <style type="text/css">
                                    ${(theme === "hand" && styles.handFontStyle) ? styles.handFontStyle : ''}
                                    ${styles.rootStyle}
                                    ${styles.mainStyle}
                                    </style>
                                </defs>
                                ${svg.innerHTML}
                            </svg>`;
                        console.log(xml)

                        vscode.postMessage({
                            type: 'download',
                            text: encodeURIComponent(xml)
                        });

                    })


                } catch (error) {
                    vscode.postMessage({
                        type: 'parseError',
                        text: "Diagram sequence text has errors",
                    });
                }
            break;

            default: 
            break;

        }
    })

})()
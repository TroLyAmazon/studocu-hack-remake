function downloadDoc() {
    // --- Final Method: New window with linked stylesheets and transform reset ---
	var tit = document.getElementsByTagName("h1")[0].innerHTML;

    // 1. Find the main document container
    const docWrapper = document.getElementById('document-wrapper');
    if (!docWrapper) {
        alert("StuHack Error: Document container 'document-wrapper' not found.");
        return;
    }

    // 2. Clone the container to manipulate it without affecting the original page
    const clonedDocWrapper = docWrapper.cloneNode(true);

    // 3. Remove inline 'transform' styles that mess up the layout
    const elementsWithTransform = clonedDocWrapper.querySelectorAll('[style*="transform"]');
    elementsWithTransform.forEach(el => {
        el.style.transform = 'none';
        el.style.width = '100%';
        el.style.height = '100%';
    });

    const documentHTML = clonedDocWrapper.innerHTML;

    // 4. Determine page orientation
    const firstPage = docWrapper.querySelector('[data-page-index]');
    const orientation = (firstPage && firstPage.offsetWidth > firstPage.offsetHeight) ? 'landscape' : 'portrait';
    const print_opt = `{@page { size: A4 ${orientation}; }}`;

    // 5. Create the head content for the new window
    let newHeadHTML = `<title>${tit}</title>`;
    // Copy all <style> and <link> tags from the original document head
    document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach(tag => {
        newHeadHTML += tag.outerHTML;
    });
    // Add our custom print styles
    newHeadHTML += `
        <style>
            @media print {
                ${print_opt}
            }
            body {
                margin: 0;
            }
            /* Ensure page content is always visible */
            .page-content {
                display: block !important;
            }
            [data-page-index] {
                page-break-after: always;
            }
        </style>
    `;

    // 6. Create a new window
    const newWindow = window.open("", "Document", "height=865,width=625,status=yes,toolbar=no,menubar=no");
    if (!newWindow) {
        alert("Please allow popups for this site to download the document.");
        return;
    }

    // 7. Write everything to the new window
    const newDoc = newWindow.document;
    newDoc.open();
    newDoc.write(`
        <html>
            <head>
                ${newHeadHTML}
            </head>
            <body>
                <article id="document-wrapper">${documentHTML}</article>
            </body>
        </html>
    `);
    newDoc.close();
}

function addButtons(){
	button1 = document.createElement("button");
	button1.classList.add("download-button-1");
	button1.innerHTML = '<svg aria-hidden="true" focusable="false" data-prefix="fas" class="svg-inline--fa" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zm-132.9 88.7L299.3 420.7c-6.2 6.2-16.4 6.2-22.6 0L171.3 315.3c-10.1-10.1-2.9-27.3 11.3-27.3H248V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v112h65.4c14.2 0 21.4 17.2 11.3 27.3z"></path></svg><span class="download-text">Download</span>';
		
	let prev_buttons = document.getElementsByClassName("fa-cloud-arrow-down");
	let i = 0;
	buttons = [];
	while(prev_buttons.length > 0){
		if(prev_buttons[0].parentNode.parentNode.firstChild.classList.contains("download-button-1")){
			prev_buttons[0].parentNode.remove();
		}else{
			buttons.push(button1.cloneNode(true, true));
			buttons[i].onclick = function() {downloadDoc()};
			prev_buttons[0].parentNode.parentNode.prepend(buttons[i]);
			prev_buttons[0].parentNode.remove();
			i++;
		}
		prev_buttons = document.getElementsByClassName("fa-cloud-arrow-down");
	}
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		addButtons();
	});
});



window.addEventListener('load', function(){
	const prev_buttons = document.getElementsByClassName("fa-cloud-arrow-down");
	if(prev_buttons.length > 0) {
		try{
			addButtons();
		}catch(err){
			console.log(err);
		}finally{
			let element = document.getElementById("viewer-wrapper");
			observer.observe(element, { attributes: true, childList: true, subtree: true});
		}
	}
});

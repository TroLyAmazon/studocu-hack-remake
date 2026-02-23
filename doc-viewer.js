// Trang xem tài liệu: URL có /document/ hoặc đã có khung viewer (dùng để tránh xóa DOM nhầm ở remove-blur/banner)
function isDocumentViewerPage() {
    try {
        var path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
        if (path.indexOf('/document/') !== -1 || path.indexOf('/doc/') !== -1) return true;
        if (document.getElementById('document-wrapper') || document.getElementById('viewer-wrapper')) return true;
    } catch (e) {}
    return false;
}

function runDocViewerLogic() {
    var hasAnchor = getDownloadAnchorElements().length > 0;
    var hasDoc = !!getDocumentWrapper();
    var viewerEl = getViewerWrapper();
    if (hasAnchor || hasDoc) {
        addButtons();
        if (viewerEl && !viewerEl._stuhackObserved) {
            viewerEl._stuhackObserved = true;
            observer.observe(viewerEl, { attributes: true, childList: true, subtree: true });
        }
    }
    // Luôn có nút tải khi đang ở URL trang tài liệu (kể cả lúc SPA chưa render xong)
    if (getDownloadAnchorElements().length === 0) ensureFloatingDownloadButton();
}

function getDocumentWrapper() {
    return document.getElementById('document-wrapper')
        || document.querySelector('[class*="document-wrapper"]')
        || document.querySelector('[class*="DocumentViewer"] [class*="document"]')
        || document.querySelector('[data-testid*="document-viewer"]')
        || document.querySelector('article[class*="document"]')
        || document.querySelector('[class*="viewer"] [class*="page-content"]')?.closest('div');
}

function getViewerWrapper() {
    return document.getElementById('viewer-wrapper')
        || document.querySelector('[class*="viewer-wrapper"]')
        || document.querySelector('[class*="ViewerWrapper"]')
        || document.querySelector('[data-testid*="viewer"]');
}

function downloadDoc() {
    // --- Final Method: New window with linked stylesheets and transform reset ---
	var h1 = document.querySelector('h1');
	var tit = (h1 && h1.innerHTML) ? h1.innerHTML : 'Document';

    // 1. Find the main document container (thử nhiều selector)
    const docWrapper = getDocumentWrapper();
    if (!docWrapper) {
        alert("StuHack: Không tìm thấy khung tài liệu. Studocu có thể đã đổi giao diện — hãy cập nhật extension hoặc báo lỗi trên GitHub.");
        return;
    }

    // 2. Clone the container to manipulate it without affecting the original page
    const clonedDocWrapper = docWrapper.cloneNode(true);

    // 3. Remove inline transform/position that gây lệch bảng và chữ trong cửa sổ in
    const elementsWithTransform = clonedDocWrapper.querySelectorAll('[style*="transform"]');
    elementsWithTransform.forEach(el => {
        el.style.transform = 'none';
        el.style.width = '100%';
        el.style.height = '100%';
    });
    clonedDocWrapper.querySelectorAll('[style*="position"]').forEach(el => {
        if (el.style.position === 'absolute' || el.style.position === 'fixed') {
            el.style.position = 'static';
            el.style.left = 'auto';
            el.style.top = 'auto';
        }
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
                padding: 12px;
            }
            /* Khắc phục lệch bảng/chữ: bỏ layout viewer, cho nội dung xếp theo thứ tự */
            #document-wrapper {
                position: relative !important;
                width: 100% !important;
                overflow: visible !important;
            }
            #document-wrapper [data-page-index],
            #document-wrapper .page-content,
            #document-wrapper [class*="page-content"] {
                position: static !important;
                left: auto !important;
                top: auto !important;
                width: 100% !important;
                display: block !important;
                transform: none !important;
            }
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

// Tìm vị trí nút Download: toàn trang trước (icon Studocu), rồi mới trong viewer
function getDownloadAnchorElements() {
    var exclude = function(arr) { return Array.from(arr).filter(function(el) { return !el.closest('.download-button-1'); }); };
    var byClass = document.getElementsByClassName("fa-cloud-arrow-down");
    if (byClass.length > 0) return exclude(byClass);
    var byAria = document.querySelectorAll('[aria-label*="download" i], [aria-label*="Download" i]');
    if (byAria.length > 0) return exclude(byAria);
    var byTestId = document.querySelectorAll('[data-testid*="download" i]');
    if (byTestId.length > 0) return exclude(byTestId);
    var root = document.getElementById('viewer-wrapper') || document.getElementById('document-wrapper');
    if (root) {
        var inViewer = root.querySelectorAll('[aria-label*="download" i], [data-testid*="download" i], .fa-cloud-arrow-down');
        if (inViewer.length > 0) return exclude(inViewer);
        var bySvg = root.querySelectorAll('button svg, a[href*="download"] svg, [class*="toolbar"] svg');
        if (bySvg.length > 0) {
            var nodes = exclude(bySvg).map(function(el) { return el.closest('button') || el.closest('a'); }).filter(Boolean);
            return nodes.filter(function(el) { return el && !el.classList.contains('download-button-1'); });
        }
    }
    return [];
}

function addButtons(){
	button1 = document.createElement("button");
	button1.classList.add("download-button-1");
	button1.innerHTML = '<svg aria-hidden="true" focusable="false" data-prefix="fas" class="svg-inline--fa" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zm-132.9 88.7L299.3 420.7c-6.2 6.2-16.4 6.2-22.6 0L171.3 315.3c-10.1-10.1-2.9-27.3 11.3-27.3H248V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v112h65.4c14.2 0 21.4 17.2 11.3 27.3z"></path></svg><span class="download-text">Download</span>';
		
	let prev_buttons = getDownloadAnchorElements();
	let i = 0;
	buttons = [];
	while(prev_buttons.length > 0){
		const anchor = prev_buttons[0];
		const parent = anchor.parentNode && anchor.parentNode.parentNode ? anchor.parentNode.parentNode : anchor.parentNode;
		if (!parent) { prev_buttons.shift(); continue; }
		if (parent.firstChild && parent.firstChild.classList && parent.firstChild.classList.contains("download-button-1")){
			anchor.parentNode && anchor.parentNode.remove();
		} else {
			buttons.push(button1.cloneNode(true));
			buttons[i].onclick = function() { downloadDoc(); };
			parent.prepend(buttons[i]);
			anchor.parentNode && anchor.parentNode.remove();
			i++;
		}
		prev_buttons = getDownloadAnchorElements();
	}
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		addButtons();
	});
});



// Nút nổi khi Studocu không còn nút download gốc — hiện khi đang ở URL document (wrap có thể chưa render)
function ensureFloatingDownloadButton() {
	if (document.getElementById('stuhack-floating-download')) return;
	var path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
	var isDocUrl = path.indexOf('/document/') !== -1 || path.indexOf('/doc/') !== -1;
	if (!isDocUrl && !getDocumentWrapper()) return;
	var btn = document.createElement('button');
	btn.id = 'stuhack-floating-download';
	btn.className = 'download-button-1 stuhack-floating-download';
	btn.innerHTML = '<svg aria-hidden="true" focusable="false" class="svg-inline--fa" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style="width:1em;height:1em"><path fill="currentColor" d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zm-132.9 88.7L299.3 420.7c-6.2 6.2-16.4 6.2-22.6 0L171.3 315.3c-10.1-10.1-2.9-27.3 11.3-27.3H248V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v112h65.4c14.2 0 21.4 17.2 11.3 27.3z"></path></svg><span class="download-text">Tải xuống</span>';
	btn.onclick = function() { downloadDoc(); };
	document.body.appendChild(btn);
}

// Chạy ngay khi load, và chạy lại sau delay để bắt SPA (viewer xuất hiện sau)
function initDocViewer() {
	try {
		if (!isDocumentViewerPage()) return;
		runDocViewerLogic();
	} catch (err) {
		console.log('StuHack:', err);
	}
}

window.addEventListener('load', function() {
	initDocViewer();
	setTimeout(initDocViewer, 600);
	setTimeout(initDocViewer, 1500);
	setTimeout(initDocViewer, 3500);
});

// Nếu trang dùng SPA, observer khi body thay đổi để thử lại khi viewer xuất hiện
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initDocViewer);
}

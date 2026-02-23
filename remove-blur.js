// Chỉ chạy trên trang xem tài liệu, tránh làm vỡ trang chủ / trang khác (fix "Well, this is awkward")
function isDocumentViewerPage() {
    if (typeof window === 'undefined' || !window.location || !window.location.pathname) return false;
    const path = window.location.pathname.toLowerCase();
    if (path.indexOf('/document/') !== -1 || path.indexOf('/doc/') !== -1) return true;
    if (document.getElementById('document-wrapper') || document.getElementById('viewer-wrapper')) return true;
    return false;
}

function getViewerWrapper() {
    return document.getElementById('viewer-wrapper')
        || document.querySelector('[class*="viewer-wrapper"]')
        || document.querySelector('[class*="ViewerWrapper"]');
}
function getDocumentWrapper() {
    return document.getElementById('document-wrapper')
        || document.querySelector('[class*="document-wrapper"]');
}
function getPageContentElements() {
    const byClass = document.getElementsByClassName('page-content');
    if (byClass.length > 0) return Array.from(byClass);
    var root = document.getElementById('viewer-wrapper') || document.getElementById('document-wrapper');
    if (!root) return [];
    return Array.from(root.querySelectorAll('[class*="page-content"], [class*="PageContent"]'));
}

const focusImages = () => {
    var bluredContainers = Array.from(document.getElementsByClassName('blurred-container'));
    bluredContainers.forEach( (bluredContainer) => {
        if (!bluredContainer.firstChild || !bluredContainer.firstChild.src) return;
        bluredContainer.firstChild.src = bluredContainer.firstChild.src.replace('/blurred/', '/');
        bluredContainer.firstChild.classList.add('bi', 'x0', 'y0', 'w1', 'h1');
        bluredContainer.classList.remove('blurred-container');
    });
    // Một số phiên bản dùng class/selector khác cho ảnh blur
    document.querySelectorAll('[class*="blurred"] img[src*="blurred"]').forEach(img => {
        img.src = img.src.replace('/blurred/', '/');
    });
};

window.addEventListener('load', function(){
    if (!isDocumentViewerPage()) return;
    var pages = getPageContentElements();
    /* Không xóa sibling của .page-content — dễ xóa nhầm nội dung tài liệu khi Studocu đổi DOM. Chỉ thêm nofilter + unblur ảnh. */
    pages.forEach(function(page) {
        if (page && page.classList) page.classList.add("nofilter");
    });
    const viewerWrapper = getViewerWrapper();
    if (viewerWrapper) {
        viewerWrapper.addEventListener('scroll', focusImages);
    }
    const documentWrapper = getDocumentWrapper();
    if (documentWrapper) {
        documentWrapper.addEventListener('scroll', focusImages);
    }
    focusImages();
});
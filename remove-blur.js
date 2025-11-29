const focusImages = () => {
    var bluredContainers = Array.from(document.getElementsByClassName('blurred-container'));
    bluredContainers.forEach( (bluredContainer) => {
        bluredContainer.firstChild.src = bluredContainer.firstChild.src.replace('/blurred/', '/');
        bluredContainer.firstChild.classList.add('bi', 'x0', 'y0', 'w1', 'h1');
        bluredContainer.classList.remove('blurred-container');
    });
}

window.addEventListener('load', function(){
    var pages = Array.from(document.getElementsByClassName('page-content'));
    pages.forEach(page => {
        if (page && page.parentNode) {
            const nodesToRemove = [];
            // Thu thập các node cần xóa
            for (const child of page.parentNode.childNodes) {
                if (child.className !== "page-content") {
                    nodesToRemove.push(child);
                }
            }
            // Xóa các node đã thu thập
            nodesToRemove.forEach(node => node.parentNode.removeChild(node));
            page.classList.add("nofilter");
        }
    });
    const viewerWrapper = document.getElementById('viewer-wrapper');
    if (viewerWrapper) {
        viewerWrapper.addEventListener('scroll', focusImages);
    }

    const documentWrapper = document.getElementById('document-wrapper');
    if (documentWrapper) {
        documentWrapper.addEventListener('scroll', focusImages);
    }

    // Run once after load to process any already-visible images
    focusImages();
});
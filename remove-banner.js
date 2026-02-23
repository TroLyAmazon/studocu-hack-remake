// Chỉ chạy thao tác xóa nặng khi đang ở trang xem tài liệu (tránh "Well, this is awkward")
function isDocumentViewerPage() {
	try {
		var path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
		if (path.indexOf('/document/') !== -1 || path.indexOf('/doc/') !== -1) return true;
		if (document.getElementById('document-wrapper') || document.getElementById('viewer-wrapper')) return true;
	} catch (e) {}
	return false;
}

window.addEventListener('load', function(){
	try {
		var isViewer = isDocumentViewerPage();

		/* Tắt: xóa child đầu của document-wrapper — dễ xóa nhầm chính nội dung tài liệu khi Studocu đổi layout
		var banner = document.getElementById('document-wrapper');
		if (banner != null && isViewer) {
			var banners = banner.childNodes;
			if (banners.length > 3) {
				banners[0].parentNode.removeChild(banners[0]);
			}
		}
		*/
		var premiumButton = document.getElementById('header-position-handle')?.childNodes[0]?.childNodes[1]?.childNodes[0]?.childNodes[1];
		if (premiumButton != null) {
			premiumButton.parentNode.removeChild(premiumButton);
		}
		var banner_wrappers = Array.from(document.getElementsByClassName('banner-wrapper'));
		if (banner_wrappers != null) {
			banner_wrappers.forEach(function (banner_wrapper) {
				if (banner_wrapper.parentNode) banner_wrapper.parentNode.removeChild(banner_wrapper);
			});
		}

		var previewBanners = document.querySelectorAll('[class*="PremiumBannerBlobWrapper_preview-banner"]');
		if (previewBanners) {
			previewBanners.forEach(function (b) {
				if (b.parentNode) b.parentNode.removeChild(b);
			});
		}

		var floatingComponents = document.querySelectorAll('[class*="FloatingComponentsWrapper_floating-components-wrapper"]');
		if (floatingComponents) {
			floatingComponents.forEach(function (component) {
				if (component.querySelector('[class*="TopFloatingComponent_top-floating-component"]') && component.parentNode) {
					component.parentNode.removeChild(component);
				}
			});
		}

		/* Mobile — chỉ trên trang document, tránh xóa nhầm nội dung trang chủ */
		if (isViewer && window.innerWidth <= 990) {
			var container = document.getElementById('page-container');
			if (container != null) {
				var pages = container.childNodes;
				for (var i = 0; i < pages.length; i++) {
					if (pages[i].id === '') {
						pages[i].parentNode.removeChild(pages[i]);
					}
				}
			}
		}

		if (isViewer) {
			var recomendations = document.getElementById('viewer-recommendations');
			if (recomendations != null && recomendations.parentNode && recomendations.parentNode.parentNode) {
				recomendations.parentNode.parentNode.removeChild(recomendations.parentNode);
			}
		}
	} catch (err) {
		console.log(err);
	}
});
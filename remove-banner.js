window.addEventListener('load', function(){
	var banner = document.getElementById('document-wrapper')
	if(banner != null){
		var banners = banner.childNodes;
		if (banners.length>3){
			banners[0].parentNode.removeChild(banners[0]);
		}
	}	
	var premiumButton = document.getElementById('header-position-handle')?.childNodes[0]?.childNodes[1]?.childNodes[0]?.childNodes[1];
	if(premiumButton != null){
		premiumButton.parentNode.removeChild(premiumButton);
	}
	var banner_wrappers = Array.from(document.getElementsByClassName('banner-wrapper'));
	if (banner_wrappers != null) {
		banner_wrappers.forEach( (banner_wrapper) => {
			banner_wrapper.parentNode.removeChild(banner_wrapper);
		});
	}

	// Remove new preview banner based on the provided HTML
	const previewBanners = document.querySelectorAll('[class*="PremiumBannerBlobWrapper_preview-banner"]');
	if (previewBanners) {
		previewBanners.forEach(banner => {
			banner.parentNode.removeChild(banner);
		});
	}

	// Remove new floating components (top banner, but keep bottom toolbar)
	const floatingComponents = document.querySelectorAll('[class*="FloatingComponentsWrapper_floating-components-wrapper"]');
	if (floatingComponents) {
		floatingComponents.forEach(component => {
			// Only remove the component if it's a banner (contains 'TopFloatingComponent') and not the toolbar
			if (component.querySelector('[class*="TopFloatingComponent_top-floating-component"]')) {
				component.parentNode.removeChild(component);
			}
		});
	}

	/* Mobile */
	if (window.innerWidth <= 990){
		var container = document.getElementById('page-container');
		if(container != null){
			var pages = container.childNodes;
			for(i=0; i<pages.length; i++) {
				if(pages[i].id == ''){
					pages[i].parentNode.removeChild(pages[i]);
				}
			}
		}
	}

    try{
		var recomendations = document.getElementById('viewer-recommendations');
		if(recomendations != null){
			recomendations.parentNode.parentNode.removeChild(recomendations.parentNode);
		}
	}catch(err){
		console.log(err);
	}
	
});
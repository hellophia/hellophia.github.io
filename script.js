 
		  const css_visible = 'rt {visibility:visible !important;}';
		  const css_hidden = 'rt {visibility:hidden !important;}';
 
		  var show_furigana = true;
		  
	      var style = document.createElement('style');
	      document.head.appendChild(style);
	      style.type = 'text/css';
		  
	      function toggle_furigana() {
	        if(show_furigana) {
	          show_furigana = false;
	          style.innerHTML = css_hidden;
	        } else {
	          show_furigana = true;
	          style.innerHTML = css_visible;
	        }
	      }
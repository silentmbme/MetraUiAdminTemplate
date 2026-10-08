(function () {
    'use strict';
    const html = document.querySelector('html');
    if(html) {
        const savedThemeMode = localStorage.getItem("nexorauiThemeMode");
        const savedDarkTheme = localStorage.getItem("nexorauidarktheme");
        if (savedThemeMode === "dark" || savedDarkTheme === "true") {
            html.setAttribute("data-theme-color", "dark")
            html.setAttribute("data-menu-color", "dark")
            html.setAttribute("data-header-color", "transparent")
        } else if (savedThemeMode === "light") {
            html.setAttribute("data-theme-color", "light");
        }
        if (localStorage.nexorauirtl) {
            html.setAttribute("dir", "rtl");
            document.querySelector("#style")?.setAttribute("href", "../assets/libs/bootstrap/css/bootstrap.rtl.min.css");
        }
        if (localStorage.getItem("nexorauilayout") == "horizontal") {
            html.setAttribute("data-sidebar-layout", "horizontal") 
        }
        function localStorageBackup() {
    
            // if there is a value stored, update color picker and background color
            // Used to retrive the data from local storage
            if (localStorage.primaryRGB) {
                if (document.querySelector('.theme-container-primary')) {
                    document.querySelector('.theme-container-primary').value = localStorage.primaryRGB;
                }
                html.style.setProperty('--theme-primary-rgb', localStorage.primaryRGB);
            }
            if (localStorage.bodyBgRGB && localStorage.bodylightRGB) {
                if (document.querySelector('.theme-container-background')) {
                    document.querySelector('.theme-container-background').value = localStorage.bodyBgRGB;
                }
                html.style.setProperty('--theme-body-bg-rgb', localStorage.bodyBgRGB);
                html.style.setProperty('--theme-body-bg-rgb2', localStorage.bodylightRGB);
                html.style.setProperty('--theme-light-rgb', localStorage.bodylightRGB);
                html.style.setProperty('--theme-form-control-bg', `rgb(${localStorage.bodylightRGB})`);
                html.style.setProperty('--theme-input-border', "rgba(255,255,255,0.1)");
                html.setAttribute('data-theme-color', 'dark');
                html.setAttribute('data-menu-color', 'dark');
                html.setAttribute('data-header-color', 'dark');
    
    
            }
            if (localStorage.getItem("nexorauiThemeMode") === "dark" || localStorage.getItem("nexorauidarktheme") === "true") {
                html.setAttribute('data-theme-color', 'dark');
                html.setAttribute('data-menu-color', 'dark');
                html.setAttribute('data-header-color', 'transparent');
            } else if (localStorage.getItem("nexorauiThemeMode") === "light") {
                html.setAttribute('data-theme-color', 'light');
            }
            if (localStorage.nexorauirtl) {
                html.setAttribute('dir', 'rtl');
                document.querySelector("#style")?.setAttribute("href", "../assets/libs/bootstrap/css/bootstrap.rtl.min.css");
                setTimeout(() => {
                    rtlFn();
                }, 10);
            }
        }
        localStorageBackup()
    }
})();


function ltrFn() {
    let html = document.querySelector('html')
    if(html) {
        if(!document.querySelector("#style").href.includes('bootstrap.min.css')){
            document.querySelector("#style")?.setAttribute("href", "../assets/libs/bootstrap/css/bootstrap.min.css");
        }
        html.setAttribute("dir", "ltr");
    }
}

function rtlFn() {
    let html = document.querySelector('html'); 
    if(html) {
        html.setAttribute("dir", "rtl");
        document.querySelector("#style")?.setAttribute("href", "../assets/libs/bootstrap/css/bootstrap.rtl.min.css");
    }
}

(function () {
  "use strict";
  const savedThemeMode = localStorage.getItem("nexorauiThemeMode");
  if (savedThemeMode === "dark" || (!savedThemeMode && localStorage.getItem("nexorauidarktheme"))) {
    document.querySelector("html").setAttribute("data-theme-color", "dark");
    document.querySelector("html").setAttribute("data-menu-color", "transparent");
    document.querySelector("html").setAttribute("data-header-color", "transparent");
  } else if (savedThemeMode === "light") {
    document.querySelector("html").setAttribute("data-theme-color", "light");
  }
  if (localStorage.nexorauirtl) {
    let html = document.querySelector("html");
    html.setAttribute("dir", "rtl");
    document
      .querySelector("#style")
      ?.setAttribute(
        "href",
        "../assets/libs/bootstrap/css/bootstrap.rtl.min.css"
      );
  }
  if (localStorage.nexorauilayout) {
    let html = document.querySelector("html");
    html.setAttribute("data-sidebar-layout", "horizontal");
    document.querySelector("html").setAttribute("data-menu-color", "transparent");
  }
  if (localStorage.getItem("nexorauilayout") == "horizontal") {
    document
      .querySelector("html")
      .setAttribute("data-sidebar-layout", "horizontal");
  }
  if (localStorage.nexorauilayout === "horizontal") {
    localStorage.removeItem("nexorauiverticalstyles");
    localStorage.removeItem("nexorauiiconmenu");
  } else {
    const oldSidebarStyle = localStorage.getItem("nexorauiverticalstyles");
    const sidebarStyle = oldSidebarStyle === "doublemenu" ? "dualmenu"
      : ["default", "dualmenu", "overlay"].includes(oldSidebarStyle)
        ? oldSidebarStyle
        : "default";
    localStorage.setItem("nexorauiverticalstyles", sidebarStyle);
    document.documentElement.setAttribute("data-sidebar-layout", "vertical");
    if (sidebarStyle === "dualmenu") {
      document.documentElement.removeAttribute("data-vertical-style");
      document.documentElement.setAttribute("data-layout-style", "dualmenu");
    } else {
      document.documentElement.removeAttribute("data-layout-style");
      document.documentElement.setAttribute("data-vertical-style", sidebarStyle);
    }
    if (localStorage.getItem("nexorauiiconmenu") === "icon-click" && sidebarStyle === "default") {
      document.documentElement.setAttribute("data-nav-style", "icon-click");
    }
  }
  if (localStorage.loaderEnable == "true") {
    document.querySelector("html").setAttribute("loader", "enable");
  } else {
    if (!document.querySelector("html").getAttribute("loader")) {
      document.querySelector("html").setAttribute("loader", "disable");
    }
  }

  function localStorageBackup() {
    // Restore saved workspace colors and background settings.
    if (localStorage.primaryRGB) {
      document
        .querySelector("html")
        .style.setProperty("--theme-primary-rgb", localStorage.primaryRGB);
    }
    if (localStorage.secondaryRGB) {
      document.querySelector("html").style.setProperty("--theme-secondary-rgb", localStorage.secondaryRGB);
    }
    if (localStorage.successRGB) {
      document.querySelector("html").style.setProperty("--theme-success-rgb", localStorage.successRGB);
    }
    if (localStorage.bodyBgRGB && localStorage.bodylightRGB) {
      if (document.querySelector(".theme-container-background")) {
        document.querySelector(".theme-container-background").value =
          localStorage.bodyBgRGB;
      }
      document
        .querySelector("html")
        .style.setProperty("--theme-body-bg-rgb", localStorage.bodyBgRGB);
      document
        .querySelector("html")
        .style.setProperty("--theme-body-bg-rgb2", localStorage.bodylightRGB);
      document
        .querySelector("html")
        .style.setProperty("--theme-light-rgb", localStorage.bodylightRGB);
      document
        .querySelector("html")
        .style.setProperty(
          "--theme-form-control-bg",
          `rgb(${localStorage.bodylightRGB})`
        );
      document
        .querySelector("html")
        .style.setProperty("--theme-gray-3", `rgb(${localStorage.bodylightRGB})`);
      document
        .querySelector("html")
        .style.setProperty("--theme-input-border", "rgba(255,255,255,0.1)");
      let html = document.querySelector("html");
      html.setAttribute("data-theme-color", "dark");
      html.setAttribute("data-menu-color", "dark");
      html.setAttribute("data-header-color", "dark");
    }
    if (localStorage.nexorauidarktheme && savedThemeMode !== "light") {
      let html = document.querySelector("html");
      html.setAttribute("data-theme-color", "dark");
    }
    if (localStorage.nexorauilayout) {
      let html = document.querySelector("html");
      let layoutValue = localStorage.getItem("nexorauilayout");
      html.setAttribute("data-sidebar-layout", "horizontal");
      setTimeout(() => {
        clearNavDropdown();
      }, 1000);
      html.setAttribute("data-nav-style", "menu-click");
      setTimeout(() => {
        checkHoriMenu();
      }, 5000);
    }
    if (localStorage.nexorauiverticalstyles) {
      let html = document.querySelector("html");
      let verticalStyles = localStorage.getItem("nexorauiverticalstyles");

      if (verticalStyles == "default") {
        html.setAttribute("data-vertical-style", "default");
      }
      if (verticalStyles == "overlay") {
        html.setAttribute("data-vertical-style", "overlay");
      }
      if (verticalStyles == "doublemenu" || verticalStyles == "dualmenu") {
        html.removeAttribute("data-vertical-style");
        html.setAttribute("data-layout-style", "dualmenu");
      }
    }
    if (localStorage.nexorauiheaderfixed) {
      let html = document.querySelector("html");
      html.setAttribute("data-header-position", "fixed");
    }
    if (localStorage.nexorauiheaderscrollable) {
      let html = document.querySelector("html");
      html.setAttribute("data-header-position", "scrollable");
    }
    if (localStorage.nexorauimenufixed) {
      let html = document.querySelector("html");
      html.setAttribute("data-menu-position", "fixed");
    }
    if (localStorage.nexorauimenuscrollable) {
      let html = document.querySelector("html");
      html.setAttribute("data-menu-position", "scrollable");
    }
    if (localStorage.nexorauiMenu) {
      let html = document.querySelector("html");
      let menuValue = localStorage.getItem("nexorauiMenu");
      switch (menuValue) {
        case "light":
          html.setAttribute("data-menu-color", "light");
          break;
        case "dark":
          html.setAttribute("data-menu-color", "dark");
          break;
        case "transparent":
          html.setAttribute("data-menu-color", "transparent");
          break;
        default:
          localStorage.setItem("nexorauiMenu", "light");
          html.setAttribute("data-menu-color", "light");
          break;
      }
    }
    if (localStorage.nexorauiHeader) {
      let html = document.querySelector("html");
      let headerValue = localStorage.getItem("nexorauiHeader");
      if (!["light", "dark", "transparent"].includes(headerValue)) {
        headerValue = "transparent";
        localStorage.setItem("nexorauiHeader", headerValue);
      }
      html.setAttribute("data-header-color", headerValue);
    }
  }
  localStorageBackup();
})();

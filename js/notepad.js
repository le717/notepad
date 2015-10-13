(function() {
  "use strict";
  /**
   * Confirm this is a nav menu item.
   *
   * @returns {Boolean} True if a nav item.
   */
  function isNavItem(id) {
    return /^menu-(?:\w+?)$/.test(id);
  }

  /**
   * Hide the current menu.
   */
  function hideNavMenu() {
    var menuVisible = document.querySelector(".menu-context.visible");
    var menuActive = document.querySelector(".menu .active");

    // Hide the currently visible menu
    if (menuVisible) {
      menuVisible.classList.remove("visible");
    }

    // Un-highlight the current nav item
    if (menuActive) {
      menuActive.classList.remove("active");
    }
  }

  var menusAreVisible = false,
      Qbody = document.querySelector("body"),
      Qmenu = document.querySelector(".menu");

  Qmenu.addEventListener("mouseover", function(e) {
    // Make sure we are on a nav item
    if (isNavItem(e.target.id)) {
      hideNavMenu();

      // Only display the menus if we are allowed to
      if (menusAreVisible) {
        // Display the currently hovered-over menu
        var contextMenu = e.target.id.match(/^menu-(\w+?)$/)[1];
        document.querySelector(".menu-context." +  contextMenu).classList.add("visible");
        e.target.classList.add("active");
      }
    }
  });

   Qmenu.addEventListener("click", function(e) {
     // Make sure the desired menu is not already visible
    if (isNavItem(e.target.id) && !e.target.classList.contains("visible")) {
      // Menus are allowed to be shown
      menusAreVisible = true;

      // Display the desired menu
      var contextMenu = e.target.id.match(/^menu-(\w+?)$/)[1];
      document.querySelector(".menu-context." +  contextMenu).classList.add("visible");
      e.target.classList.add("active");
    }
   });

  Qbody.addEventListener("click", function(e) {
    if (!isNavItem(e.target.id) && !e.target.classList.contains("menu-disabled") && !e.target.classList.contains("blank")) {
      // Menus are not allowed to be shown at this time
      if (menusAreVisible) {
        menusAreVisible = false;
      }

      // Hide the current menu
      hideNavMenu();
    }
  });


  var themeWin7  = document.querySelector(".menu-context input#theme-win7"),
      themeWin10 = document.querySelector(".menu-context input#theme-win10");

  // Default to the Windows 10 theme
  themeWin10.checked = true;

  // Toggle between the themes
  themeWin7.onchange = themeWin10.onchange = function() {
    Qbody.classList.toggle("win10");
    Qbody.classList.toggle("win7");
  };


  var wordWrap  = document.querySelector("input#word-wrap"),
      QtextArea = document.querySelector("textarea");

  // Word wrap is disabled by default
  wordWrap.checked = false;

  // Toggle word wrap
  wordWrap.onchange = function() {
    QtextArea.classList.toggle("no-word-wrap");
  };


  var fileName  = "MyFile.txt",
      QSave     = document.querySelector(".menu-context #action-save"),
      QSaveLink = document.querySelector(".menu-context #action-save a");

  // Save the note to the computer
  QSave.addEventListener("click", function(e) {
    // If the text was not clicked, click it so the download will start
    if (e.target.tagName.toLowerCase() !== "a") {
      QSaveLink.click();

    // Download the note
    } else {
      // Create a blob object of the contents
      var blob = new Blob([QtextArea.value], {type: "text/plain"});

      // Internet Explorer/MS Edge
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);

      // All other browsers
      } else {
        QSaveLink.setAttribute("href", URL.createObjectURL(blob));
        QSaveLink.setAttribute("download", fileName);
      }
    }
  });


  /**
   * Create a Notepad API instance.
   *
   * @constructs Notepad
   * @param {Object} selectors [[Description]]
   */
  function Notepad(selectors) {
    this.fileName = "MyFile.txt";
    this.selectors = selectors;
    self = this;
  }

  /**
   * Create a new file.
   */
  Notepad.prototype.fileNew = function() {
    self.selectors.textarea.value = "";
  };

  // Create a new Notepad API instance
  var notepad = new Notepad({
    textarea: document.querySelector("textarea")
  });

  // File > New command
  document.querySelector(".menu-context #action-new").addEventListener("click", notepad.fileNew);
}());

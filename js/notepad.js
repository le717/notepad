/* jshint browser: true */
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
    // Close the menu if the label is clicked again
    if (isNavItem(e.target.id) && menusAreVisible) {
      menusAreVisible = false;
      hideNavMenu();
      return;
    }

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
        hideNavMenu();
      }
    }
  });


  var Notepad = (function() {
    var self = null;

    /**
    * Get the class of the current theme.
    *
    * @private
    * @returns {String}
    */
    function __getCurrentTheme(body) {
      return body.className.match(/^win\d{1,2}$/)[0];
    }

    /**
    * Create a Notepad API instance.
    *
    * @constructs Notepad
    * @param {Object} selectors [[Description]]
    */
    function Notepad(selectors) {
      this.fileName = "Note.txt";
      this.selectors = selectors;
      self = this;
    }

    /**
    * Create a new file.
    */
    Notepad.prototype.fileNew = function() {
      self.selectors.textarea.value = "";
    };

    /**
    * Save the document to the computer.
    */
    Notepad.prototype.fileSave = function() {
      // Create a blob object of the contents
      var blob = new Blob([self.selectors.textarea.value], {type: "text/plain"});

      // Internet Explorer/MS Edge
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, self.fileName);

      // All other browsers
      } else {
        // Create the download link
        var saveLink = document.createElement("a");
        saveLink.style.display = "none";
        saveLink.setAttribute("href", URL.createObjectURL(blob));
        saveLink.setAttribute("download", self.fileName);
        self.selectors.body.appendChild(saveLink);

        // Start the download and remove the link
        saveLink.click();
        self.selectors.body.removeChild(saveLink);
      }
    };

    /**
     * Print the current document.
     */
    Notepad.prototype.filePrint = function() {
      window.print();
    };

    /**
    * Toggle word wrap.
    */
    Notepad.prototype.toggleWordWrap = function() {
      self.selectors.textarea.classList.toggle("no-word-wrap");
    };

    /**
    * Change the UI theme.
    *
    * @param {String} newTheme The desired theme to use.
    * @returns {Boolean} True if the theme could be changed, false otherwise.
    */
    Notepad.prototype.changeTheme = function(newTheme) {
      var validThemes  = ["win7", "win10"],
          currentTheme = __getCurrentTheme(self.selectors.body);

      // The desired theme is already applied or not available
      if (newTheme === currentTheme || validThemes.indexOf(newTheme) === -1) {
        return false;
      }

      // Apply the desired theme
      self.selectors.body.classList.remove(currentTheme);
      self.selectors.body.classList.add(newTheme);
      return true;
    };

    return Notepad;
  })();


  // Create a new Notepad API instance
  var notepad = new Notepad({
    body: document.querySelector("body"),
    textarea: document.querySelector("textarea")
  });

  // File > New command
  document.querySelector(".menu-context #action-new").addEventListener("click", notepad.fileNew);

  // File > Save command
  document.querySelector(".menu-context #action-save").addEventListener("click", notepad.fileSave);

  // File > Print command
  document.querySelector(".menu-context #action-print").addEventListener("click", notepad.filePrint);

  // Format > Word Wrap
  var QwordWrap  = document.querySelector("input#word-wrap");

  // Word wrap is disabled by default
  QwordWrap.checked = false;
  QwordWrap.addEventListener("click", notepad.toggleWordWrap);

  // View > Windows X
  var themeWin7  = document.querySelector(".menu-context input#theme-win7"),
      themeWin10 = document.querySelector(".menu-context input#theme-win10");

  // Default to the Windows 10 theme
  themeWin10.checked = true;
  themeWin7.onchange = themeWin10.onchange = function(e) {
    notepad.changeTheme(e.target.id.match(/^theme-(win\d{1,2})/)[1]);
  };
}());

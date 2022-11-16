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
   * Find the root nav item element.
   */
  function findNavItem(ele) {
    // The desired element was not found on the page
    if (ele === null) {
      return null;
    }

    // We found the desired element
    if (isNavItem(ele.id)) {
      return ele;

      // Keep searching for the element
    } else {
      return findNavItem(ele.parentElement);
    }
  }

  /**
   * Hide the current menu.
   */
  function hideNavMenu() {
    var menuActive  = document.querySelector(".menu .active");
    var menuVisible = document.querySelector(".menu-context.visible");

    // Hide the currently visible menu
    if (menuVisible) {
      menuVisible.classList.remove("visible");
    }

    // Un-highlight the current nav item
    if (menuActive) {
      menuActive.classList.remove("active");
    }
  }

  /**
   * Show the desired menu.
   */
  function showNavMenu(ele) {
    var contextMenu = ele.id.match(/^menu-(\w+?)$/)[1];
    document.querySelector(".menu-context." +  contextMenu).classList.add("visible");
    ele.classList.add("active");
  }

  var menusAreVisible = false,
      Qbody = document.querySelector("body"),
      Qmenu = document.querySelector(".menu"),
      QtextArea = document.querySelector("textarea");

  Qmenu.addEventListener("mouseover", function(e) {
    // Make sure we are on a nav item
    if (isNavItem(e.target.id)) {
      hideNavMenu();

      // Only display the menus if we are allowed to
      if (menusAreVisible) {
        showNavMenu(e.target);
      }
    }
  });

  Qmenu.addEventListener("click", function(e) {
    var navItem = findNavItem(e.target);
    // Close the menu if the label is clicked again
    if (navItem && menusAreVisible) {
      menusAreVisible = false;
      hideNavMenu();
      return;
    }

    // Make sure the desired menu is not already visible
    if (navItem && !navItem.classList.contains("visible")) {
      // Menus are allowed to be shown
      menusAreVisible = true;
      showNavMenu(navItem);
    }
   });

  Qbody.addEventListener("click", function(e) {
    var navItem = findNavItem(e.target);

    if (!navItem && !e.target.classList.contains("menu-disabled") &&
        !e.target.classList.contains("blank")) {
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
     * Create a Notepad API instance.
     *
     * @constructs Notepad
     * @param {Object} ele
     */
    function Notepad(ele) {
      this.fileName = "Note.txt";
      this.ele = ele;
      this.wordWrap = false;
      this.statusBar = false;
      this.editor = ele.textarea;
      self = this;
    }

    /**
     * @private
     */
    Notepad.prototype.__getCursor = function() {
      var lines = self.editor.value.substr(0, self.editor.selectionStart).split("\n");
      return {
        col: lines[lines.length - 1].length + 1,
        line: lines.length
      };
    };

    /**
     * @private
     */
    Notepad.prototype.__displayCursor = function() {
      var pos = self.__getCursor();
      self.ele.statusBar.children[1].children[0].textContent = pos.line;
      self.ele.statusBar.children[1].children[1].textContent = pos.col;
    };

    /**
     * @private
     * Set the cursor at a particular point.
     *
     * @param {number} start
     * @param {number} end
     */
    Notepad.prototype.__setCursor = function(start, end) {
      if (end === undefined) end = start;
      self.editor.selectionStart = start.toString();
      self.editor.selectionEnd = end.toString();
      self.__focusEditor();
    };

    /**
     * @private
     * Update the title bar and tab title with the file name.
     *
     * @param {string} fileName
     */
    Notepad.prototype.__updateTitleBar = function(fileName) {
      self.ele.titleFileName.textContent = fileName;
      if (fileName === "" || fileName === "Untitled") {
        document.title = "Notepad"
      } else {
        document.title = fileName + " - " + document.title;
      }
    };

    /**
     * @private
     * Focus the editor.
     */
    Notepad.prototype.__focusEditor = function() {
      self.editor.focus();
    };

    /**
     * Create a new file.
     */
    Notepad.prototype.fileNew = function() {
      self.editor.value = "";
      self.__focusEditor();
      self.__updateTitleBar("Untitled");
    };

    /**
     * Save the document to the computer.
     */
    Notepad.prototype.fileSave = function() {
      // Create a blob object of the contents
      var blob = new Blob([self.editor.value], {type: "text/plain"});

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
        self.ele.body.appendChild(saveLink);

        // Start the download and remove the link
        saveLink.click();
        self.ele.body.removeChild(saveLink);
      }

      self.__updateTitleBar(self.fileName);
    };

    /**
     * Save a document to the computer using a custom file name.
     */
    Notepad.prototype.fileSaveAs = function() {
      var newName = window.prompt("Enter the desired file name").trim();

      // Do not permit a blank name
      var blank_name = /^\s*$/.test(newName);
      if (!blank_name) {
        self.fileName = newName;
      }

      // Only append .txt if the user hasn't typed it already
      var ends_with_txt = /\.txt$/.test(newName);
      if (!ends_with_txt) {
        self.fileName = newName + ".txt";
      }
      self.fileSave();
    };

    /**
     * Print the current document.
     */
    Notepad.prototype.filePrint = function() {
      window.print();
    };

    /**
     * Cut the selected text to the OS clipboard.
     */
    Notepad.prototype.editCut = function() {
      // Copy the selected text first
      self.editCopy();

      // Now get the selected text and delete it
      let selectedText = self.editor.value.substr(
        self.editor.selectionStart,
        self.editor.selectionEnd - self.editor.selectionStart
      );
      self.editor.value = self.editor.value.replace(selectedText, "");
    }

    /**
     * Copy the selected text to the OS clipboard.
     */
    Notepad.prototype.editCopy = function() {
      // Get the selected text
      let selectedText = self.editor.value.substr(
        self.editor.selectionStart,
        self.editor.selectionEnd - self.editor.selectionStart
      );

      // Attempt to copy the text to the clipboard.
      // I don't care if it failed
      navigator.clipboard.writeText(selectedText);
    }

    /**
     * Insert the current time and date into the document
     * at the current cursor position.
     */
    Notepad.prototype.editTimeDate = function() {
      var date = new Date(),
          curHour = date.getHours(),
          curMin  = date.getMinutes(),
          timeOfDay = curHour > 11 ? "PM" : "AM",
          cursorPos = self.editor.selectionStart;

      // Midnight
      if (curHour === 0) {
        curHour = "12";

      // Afternoon
      } else if (curHour > 11) {
        curHour -= 12;
      }

      // Pretty print the minutes
      if (curMin < 10) {
        curMin = "0" + curMin;
      }

      // Construct the formatted string
      var dateString = curHour + ":" + curMin + " " + timeOfDay + " " +
                       date.toLocaleDateString();

      // Update the document with the date string
      var front = self.editor.value.substring(0, cursorPos),
          back  = self.editor.value.substring(cursorPos, self.editor.length);

      // Insert the date string into the document
      self.editor.value = front + dateString + back;
      self.editor.selectionStart = cursorPos;
      self.editor.selectionEnd = cursorPos;
      self.__focusEditor();
    };

    /**
     * Toggle the status bar.
     */
    Notepad.prototype.toggleStatusBar = function() {
      // Alter state values based on toggle state
      self.statusBar = !self.statusBar;
      self.ele.areaEdit.classList.toggle("has-status-bar");
      self.ele.statusBar.classList.toggle("visible");
      window.localStorage.setItem("toggle-status-bar", self.statusBar);
      self.__focusEditor();

      // Display the information depending on enable/disable status
      if (self.statusBar) {
        self.__displayCursor();
        self.editor.addEventListener("keyup", self.__displayCursor);
        self.editor.addEventListener("click", self.__displayCursor);
      } else {
        self.editor.removeEventListener("keyup", self.__displayCursor);
        self.editor.removeEventListener("click", self.__displayCursor);
      }
    };

    /**
     * Toggle word wrap.
     */
    Notepad.prototype.toggleWordWrap = function() {
      // Alter state values based on toggle state
      self.wordWrap = !self.wordWrap;
      self.editor.classList.toggle("no-word-wrap");
      window.localStorage.setItem("toggle-word-wrap", self.wordWrap);
      self.__setCursor(0);

      // If the status bar is enabled, update the cursor pos display
      if (self.statusBar) {
        self.__displayCursor();
      }
    };

    /**
     * Select all text in the text area.
     */
    Notepad.prototype.editSelectAll = function() {
      self.editor.select();
    };

    /**
     * View Notepad help website.
     */
    Notepad.prototype.helpViewHelp = function() {
      var url = "https://answers.microsoft.com/en-us/windows/forum/apps_windows_10";
      var win = window.open(url, "_blank");
      win.focus();
    };

    return Notepad;
  })();


  // Create a new Notepad API instance
  var notepad = new Notepad({
    body: document.querySelector("body"),
    areaEdit: document.querySelector("#area-edit"),
    textarea: QtextArea,
    titleFileName: document.querySelector("#title-file-name"),
    statusBar: document.querySelector("#area-status-bar"),
  });

  // File > New command
  document.querySelector(".menu-context #action-new").addEventListener("click", notepad.fileNew);

  // File > Save command
  document.querySelector(".menu-context #action-save").addEventListener("click", notepad.fileSave);

  // File > Save As command
  document.querySelector(".menu-context #action-save-as").addEventListener("click", notepad.fileSaveAs);

  // File > Print command
  document.querySelector(".menu-context #action-print").addEventListener("click", notepad.filePrint);

  // Edit > Cut
  document.querySelector(".menu-context #action-cut").addEventListener("click", notepad.editCut);

  // Edit > Copy
  document.querySelector(".menu-context #action-copy").addEventListener("click", notepad.editCopy);

  // Edit > Time/Date
  document.querySelector(".menu-context #action-time-date").addEventListener("click", notepad.editTimeDate);

  // Edit > Select All
  document.querySelector(".menu-context #action-select-all").addEventListener("click", notepad.editSelectAll);

  // Format > Word Wrap
  // Word wrap is disabled by default
  var QwordWrap = document.querySelector("input#word-wrap");
  QwordWrap.checked = false;
  QwordWrap.addEventListener("click", notepad.toggleWordWrap);

  // Enable work wrap if it was previously enabled
  if (window.localStorage.getItem("toggle-word-wrap") === "true") {
    QwordWrap.click();
  }

  // View > Status Bar
  // Status bar is disabled by default
  var QstatusBar = document.querySelector("input#status-bar");
  QstatusBar.checked = false;
  QstatusBar.addEventListener("click", notepad.toggleStatusBar);

  // Enable the status bar if it was previously enabled
  if (window.localStorage.getItem("toggle-status-bar") === "true") {
    QstatusBar.click();
  }

  // Help > View Help
  document.querySelector(".menu-context #action-view-help").addEventListener("click", notepad.helpViewHelp);
}());

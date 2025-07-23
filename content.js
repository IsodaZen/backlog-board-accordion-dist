(() => {
  const CONFIG = {
    COLLAPSED_WIDTH: "72px",
    BUTTON_DELAY: 500,
    INIT_DELAY: 1e3
  };
  function isBoardPage() {
    return window.location.pathname.includes("/board/");
  }
  function addCollapseButtons() {
    const statusColumns = document.querySelectorAll(".css-hrpltn-col");
    statusColumns.forEach((column, index) => {
      const statusRow = column.querySelector(".css-ujzck4-row");
      if (!statusRow || statusRow.querySelector(".collapse-button")) return;
      const collapseButton = createCollapseButton(column, index);
      const header = statusRow.querySelector("h3.SlotHead");
      if (header) {
        header.appendChild(collapseButton);
      }
      restoreColumnState(column, collapseButton, index);
    });
  }
  function createCollapseButton(column, index) {
    const collapseButton = document.createElement("button");
    collapseButton.className = "collapse-button";
    collapseButton.innerHTML = "▼";
    collapseButton.title = "ステータス列を折りたたむ";
    collapseButton.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      padding: 2px 4px;
      border-radius: 3px;
      transition: background-color 0.2s;
      align-self: center;
      margin-left: 4px;
    `;
    collapseButton.addEventListener("mouseenter", () => {
      collapseButton.style.backgroundColor = "#f0f0f0";
    });
    collapseButton.addEventListener("mouseleave", () => {
      collapseButton.style.backgroundColor = "transparent";
    });
    collapseButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleColumn(column, collapseButton, index);
    });
    return collapseButton;
  }
  function toggleColumn(column, button, index) {
    const elements = getColumnElements(column);
    if (!elements.issueList) return;
    const isCollapsed = elements.issueList.style.display === "none";
    console.log("toggleColumn() isCollapsed =", isCollapsed);
    if (isCollapsed) {
      expandColumn(column, button, elements);
    } else {
      collapseColumn(column, button, elements);
    }
    saveColumnState(index, !isCollapsed);
  }
  function getColumnElements(column) {
    return {
      issueList: column.querySelector("ul.SlotBox"),
      statusName: column.querySelector("h3.SlotHead > div:nth-child(2)"),
      expandArea: column.querySelector("h3.SlotHead > div:nth-child(3)"),
      addIssueButton: column.querySelector(".css-oslcxi-row"),
      descriptionArea: column.querySelector(".css-1vsmiu0-box")
    };
  }
  function expandColumn(column, button, elements) {
    if (elements.issueList) elements.issueList.style.display = "";
    if (elements.statusName) elements.statusName.style.display = "";
    if (elements.expandArea) elements.expandArea.style.display = "";
    if (elements.addIssueButton) elements.addIssueButton.style.display = "";
    if (elements.descriptionArea) elements.descriptionArea.style.display = "";
    button.innerHTML = "▼";
    button.title = "ステータス列を折りたたむ";
    column.style.width = "";
    column.style.minWidth = "";
    column.style.maxWidth = "";
    column.style.paddingRight = "";
    const firstChild = column.firstElementChild;
    if (firstChild) {
      firstChild.style.height = "";
    }
    removeIconTooltip(column);
  }
  function collapseColumn(column, button, elements) {
    if (elements.issueList) elements.issueList.style.display = "none";
    if (elements.statusName) elements.statusName.style.display = "none";
    if (elements.expandArea) elements.expandArea.style.display = "none";
    if (elements.addIssueButton) elements.addIssueButton.style.display = "none";
    if (elements.descriptionArea) elements.descriptionArea.style.display = "none";
    button.innerHTML = "▶";
    button.title = "ステータス列を展開する";
    column.style.width = CONFIG.COLLAPSED_WIDTH;
    column.style.minWidth = CONFIG.COLLAPSED_WIDTH;
    column.style.maxWidth = CONFIG.COLLAPSED_WIDTH;
    if (column.matches(".css-hrpltn-col:last-of-type")) {
      column.style.paddingRight = "0";
    }
    const firstChild = column.firstElementChild;
    if (firstChild) {
      firstChild.style.height = "100%";
    }
    addIconTooltip(column, elements);
  }
  function addIconTooltip(column, elements) {
    var _a;
    const statusIcon = column.querySelector(".StatusIcon");
    if (statusIcon && elements.statusName) {
      const statusText = ((_a = elements.statusName.textContent) == null ? void 0 : _a.trim()) || "";
      statusIcon.title = statusText;
      statusIcon.style.cursor = "pointer";
    }
  }
  function removeIconTooltip(column) {
    const statusIcon = column.querySelector(".StatusIcon");
    if (statusIcon) {
      statusIcon.title = "";
      statusIcon.style.cursor = "";
    }
  }
  function saveColumnState(index, isCollapsed) {
    const key = `backlog_column_${index}_${window.location.pathname}`;
    try {
      chrome.storage.local.set({ [key]: isCollapsed });
    } catch (error) {
      console.error("Failed to save column state:", error);
    }
  }
  function restoreColumnState(column, button, index) {
    const key = `backlog_column_${index}_${window.location.pathname}`;
    try {
      chrome.storage.local.get(key, (result) => {
        if (result[key]) {
          const elements = getColumnElements(column);
          collapseColumn(column, button, elements);
        }
      });
    } catch (error) {
      console.error("Failed to restore column state:", error);
    }
  }
  function observeChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          if (isBoardPage()) {
            setTimeout(addCollapseButtons, CONFIG.BUTTON_DELAY);
          }
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  function expandAllColumns() {
    const statusColumns = document.querySelectorAll(".css-hrpltn-col");
    statusColumns.forEach((column, index) => {
      const button = column.querySelector(".collapse-button");
      if (button && button.innerHTML === "▶") {
        toggleColumn(column, button, index);
      }
    });
  }
  function collapseAllColumns() {
    const statusColumns = document.querySelectorAll(".css-hrpltn-col");
    statusColumns.forEach((column, index) => {
      const button = column.querySelector(".collapse-button");
      if (button && button.innerHTML === "▼") {
        toggleColumn(column, button, index);
      }
    });
  }
  function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "E") {
        e.preventDefault();
        expandAllColumns();
      }
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        collapseAllColumns();
      }
    });
  }
  function init() {
    if (isBoardPage()) {
      setTimeout(addCollapseButtons, CONFIG.INIT_DELAY);
      setupKeyboardShortcuts();
    }
    observeChanges();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnRlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQmFja2xvZyBCb2FyZCBFbmhhbmNlciAtIENvbnRlbnQgU2NyaXB0IChUeXBlU2NyaXB0IFZlcnNpb24pXG5cbmludGVyZmFjZSBDb25maWcge1xuICBDT0xMQVBTRURfV0lEVEg6IHN0cmluZztcbiAgQlVUVE9OX0RFTEFZOiBudW1iZXI7XG4gIElOSVRfREVMQVk6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIENvbHVtbkVsZW1lbnRzIHtcbiAgaXNzdWVMaXN0OiBIVE1MRWxlbWVudCB8IG51bGw7XG4gIHN0YXR1c05hbWU6IEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgZXhwYW5kQXJlYTogSFRNTEVsZW1lbnQgfCBudWxsO1xuICBhZGRJc3N1ZUJ1dHRvbjogSFRNTEVsZW1lbnQgfCBudWxsO1xuICBkZXNjcmlwdGlvbkFyZWE6IEhUTUxFbGVtZW50IHwgbnVsbDtcbn1cblxuKCgpOiB2b2lkID0+IHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGNvbnN0IENPTkZJRzogQ29uZmlnID0ge1xuICAgIENPTExBUFNFRF9XSURUSDogJzcycHgnLFxuICAgIEJVVFRPTl9ERUxBWTogNTAwLFxuICAgIElOSVRfREVMQVk6IDEwMDAsXG4gIH07XG5cbiAgZnVuY3Rpb24gaXNCb2FyZFBhZ2UoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmNsdWRlcygnL2JvYXJkLycpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQ29sbGFwc2VCdXR0b25zKCk6IHZvaWQge1xuICAgIGNvbnN0IHN0YXR1c0NvbHVtbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNzcy1ocnBsdG4tY29sJyk7XG5cbiAgICBzdGF0dXNDb2x1bW5zLmZvckVhY2goKGNvbHVtbiwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHN0YXR1c1JvdyA9IGNvbHVtbi5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmNzcy11anpjazQtcm93Jyk7XG4gICAgICBpZiAoIXN0YXR1c1JvdyB8fCBzdGF0dXNSb3cucXVlcnlTZWxlY3RvcignLmNvbGxhcHNlLWJ1dHRvbicpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGNvbGxhcHNlQnV0dG9uID0gY3JlYXRlQ29sbGFwc2VCdXR0b24oY29sdW1uLCBpbmRleCk7XG5cbiAgICAgIGNvbnN0IGhlYWRlciA9IHN0YXR1c1Jvdy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignaDMuU2xvdEhlYWQnKTtcbiAgICAgIGlmIChoZWFkZXIpIHtcbiAgICAgICAgaGVhZGVyLmFwcGVuZENoaWxkKGNvbGxhcHNlQnV0dG9uKTtcbiAgICAgIH1cblxuICAgICAgcmVzdG9yZUNvbHVtblN0YXRlKGNvbHVtbiwgY29sbGFwc2VCdXR0b24sIGluZGV4KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbGxhcHNlQnV0dG9uKGNvbHVtbjogSFRNTEVsZW1lbnQsIGluZGV4OiBudW1iZXIpOiBIVE1MQnV0dG9uRWxlbWVudCB7XG4gICAgY29uc3QgY29sbGFwc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBjb2xsYXBzZUJ1dHRvbi5jbGFzc05hbWUgPSAnY29sbGFwc2UtYnV0dG9uJztcbiAgICBjb2xsYXBzZUJ1dHRvbi5pbm5lckhUTUwgPSAn4pa8JztcbiAgICBjb2xsYXBzZUJ1dHRvbi50aXRsZSA9ICfjgrnjg4bjg7zjgr/jgrnliJfjgpLmipjjgorjgZ/jgZ/jgoAnO1xuXG4gICAgY29sbGFwc2VCdXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgIGJhY2tncm91bmQ6IG5vbmU7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICBwYWRkaW5nOiAycHggNHB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xuICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAwLjJzO1xuICAgICAgYWxpZ24tc2VsZjogY2VudGVyO1xuICAgICAgbWFyZ2luLWxlZnQ6IDRweDtcbiAgICBgO1xuXG4gICAgY29sbGFwc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcbiAgICAgIGNvbGxhcHNlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZjBmMGYwJztcbiAgICB9KTtcblxuICAgIGNvbGxhcHNlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgICBjb2xsYXBzZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnO1xuICAgIH0pO1xuXG4gICAgY29sbGFwc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHRvZ2dsZUNvbHVtbihjb2x1bW4sIGNvbGxhcHNlQnV0dG9uLCBpbmRleCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29sbGFwc2VCdXR0b247XG4gIH1cblxuICBmdW5jdGlvbiB0b2dnbGVDb2x1bW4oY29sdW1uOiBIVE1MRWxlbWVudCwgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gZ2V0Q29sdW1uRWxlbWVudHMoY29sdW1uKTtcbiAgICBpZiAoIWVsZW1lbnRzLmlzc3VlTGlzdCkgcmV0dXJuO1xuXG4gICAgY29uc3QgaXNDb2xsYXBzZWQgPSBlbGVtZW50cy5pc3N1ZUxpc3Quc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnO1xuXG4gICAgY29uc29sZS5sb2coJ3RvZ2dsZUNvbHVtbigpIGlzQ29sbGFwc2VkID0nLCBpc0NvbGxhcHNlZCk7XG5cbiAgICBpZiAoaXNDb2xsYXBzZWQpIHtcbiAgICAgIGV4cGFuZENvbHVtbihjb2x1bW4sIGJ1dHRvbiwgZWxlbWVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb2xsYXBzZUNvbHVtbihjb2x1bW4sIGJ1dHRvbiwgZWxlbWVudHMpO1xuICAgIH1cblxuICAgIHNhdmVDb2x1bW5TdGF0ZShpbmRleCwgIWlzQ29sbGFwc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENvbHVtbkVsZW1lbnRzKGNvbHVtbjogSFRNTEVsZW1lbnQpOiBDb2x1bW5FbGVtZW50cyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzc3VlTGlzdDogY29sdW1uLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCd1bC5TbG90Qm94JyksXG4gICAgICBzdGF0dXNOYW1lOiBjb2x1bW4ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJ2gzLlNsb3RIZWFkID4gZGl2Om50aC1jaGlsZCgyKScpLFxuICAgICAgZXhwYW5kQXJlYTogY29sdW1uLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCdoMy5TbG90SGVhZCA+IGRpdjpudGgtY2hpbGQoMyknKSxcbiAgICAgIGFkZElzc3VlQnV0dG9uOiBjb2x1bW4ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jc3Mtb3NsY3hpLXJvdycpLFxuICAgICAgZGVzY3JpcHRpb25BcmVhOiBjb2x1bW4ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jc3MtMXZzbWl1MC1ib3gnKSxcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZXhwYW5kQ29sdW1uKFxuICAgIGNvbHVtbjogSFRNTEVsZW1lbnQsXG4gICAgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICBlbGVtZW50czogQ29sdW1uRWxlbWVudHNcbiAgKTogdm9pZCB7XG4gICAgaWYgKGVsZW1lbnRzLmlzc3VlTGlzdCkgZWxlbWVudHMuaXNzdWVMaXN0LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICBpZiAoZWxlbWVudHMuc3RhdHVzTmFtZSkgZWxlbWVudHMuc3RhdHVzTmFtZS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgaWYgKGVsZW1lbnRzLmV4cGFuZEFyZWEpIGVsZW1lbnRzLmV4cGFuZEFyZWEuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIGlmIChlbGVtZW50cy5hZGRJc3N1ZUJ1dHRvbikgZWxlbWVudHMuYWRkSXNzdWVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIGlmIChlbGVtZW50cy5kZXNjcmlwdGlvbkFyZWEpIGVsZW1lbnRzLmRlc2NyaXB0aW9uQXJlYS5zdHlsZS5kaXNwbGF5ID0gJyc7XG5cbiAgICBidXR0b24uaW5uZXJIVE1MID0gJ+KWvCc7XG4gICAgYnV0dG9uLnRpdGxlID0gJ+OCueODhuODvOOCv+OCueWIl+OCkuaKmOOCiuOBn+OBn+OCgCc7XG5cbiAgICBjb2x1bW4uc3R5bGUud2lkdGggPSAnJztcbiAgICBjb2x1bW4uc3R5bGUubWluV2lkdGggPSAnJztcbiAgICBjb2x1bW4uc3R5bGUubWF4V2lkdGggPSAnJztcblxuICAgIC8vIHBhZGRpbmctcmlnaHTjgpLlhYPjgavmiLvjgZlcbiAgICBjb2x1bW4uc3R5bGUucGFkZGluZ1JpZ2h0ID0gJyc7XG5cbiAgICBjb25zdCBmaXJzdENoaWxkID0gY29sdW1uLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50O1xuICAgIGlmIChmaXJzdENoaWxkKSB7XG4gICAgICBmaXJzdENoaWxkLnN0eWxlLmhlaWdodCA9ICcnO1xuICAgIH1cblxuICAgIHJlbW92ZUljb25Ub29sdGlwKGNvbHVtbik7XG4gIH1cblxuICBmdW5jdGlvbiBjb2xsYXBzZUNvbHVtbihcbiAgICBjb2x1bW46IEhUTUxFbGVtZW50LFxuICAgIGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQsXG4gICAgZWxlbWVudHM6IENvbHVtbkVsZW1lbnRzXG4gICk6IHZvaWQge1xuICAgIGlmIChlbGVtZW50cy5pc3N1ZUxpc3QpIGVsZW1lbnRzLmlzc3VlTGlzdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGlmIChlbGVtZW50cy5zdGF0dXNOYW1lKSBlbGVtZW50cy5zdGF0dXNOYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWYgKGVsZW1lbnRzLmV4cGFuZEFyZWEpIGVsZW1lbnRzLmV4cGFuZEFyZWEuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAoZWxlbWVudHMuYWRkSXNzdWVCdXR0b24pIGVsZW1lbnRzLmFkZElzc3VlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWYgKGVsZW1lbnRzLmRlc2NyaXB0aW9uQXJlYSkgZWxlbWVudHMuZGVzY3JpcHRpb25BcmVhLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICBidXR0b24uaW5uZXJIVE1MID0gJ+KWtic7XG4gICAgYnV0dG9uLnRpdGxlID0gJ+OCueODhuODvOOCv+OCueWIl+OCkuWxlemWi+OBmeOCiyc7XG5cbiAgICBjb2x1bW4uc3R5bGUud2lkdGggPSBDT05GSUcuQ09MTEFQU0VEX1dJRFRIO1xuICAgIGNvbHVtbi5zdHlsZS5taW5XaWR0aCA9IENPTkZJRy5DT0xMQVBTRURfV0lEVEg7XG4gICAgY29sdW1uLnN0eWxlLm1heFdpZHRoID0gQ09ORklHLkNPTExBUFNFRF9XSURUSDtcblxuICAgIC8vIOacgOW+jOOBruWIl+OBruWgtOWQiOOAgXBhZGRpbmctcmlnaHTjgpLnhKHlirnljJZcbiAgICBpZiAoY29sdW1uLm1hdGNoZXMoJy5jc3MtaHJwbHRuLWNvbDpsYXN0LW9mLXR5cGUnKSkge1xuICAgICAgY29sdW1uLnN0eWxlLnBhZGRpbmdSaWdodCA9ICcwJztcbiAgICB9XG5cbiAgICBjb25zdCBmaXJzdENoaWxkID0gY29sdW1uLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50O1xuICAgIGlmIChmaXJzdENoaWxkKSB7XG4gICAgICBmaXJzdENoaWxkLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICB9XG5cbiAgICBhZGRJY29uVG9vbHRpcChjb2x1bW4sIGVsZW1lbnRzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZEljb25Ub29sdGlwKGNvbHVtbjogSFRNTEVsZW1lbnQsIGVsZW1lbnRzOiBDb2x1bW5FbGVtZW50cyk6IHZvaWQge1xuICAgIGNvbnN0IHN0YXR1c0ljb24gPSBjb2x1bW4ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5TdGF0dXNJY29uJyk7XG4gICAgaWYgKHN0YXR1c0ljb24gJiYgZWxlbWVudHMuc3RhdHVzTmFtZSkge1xuICAgICAgY29uc3Qgc3RhdHVzVGV4dCA9IGVsZW1lbnRzLnN0YXR1c05hbWUudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCAnJztcbiAgICAgIHN0YXR1c0ljb24udGl0bGUgPSBzdGF0dXNUZXh0O1xuICAgICAgc3RhdHVzSWNvbi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlSWNvblRvb2x0aXAoY29sdW1uOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IHN0YXR1c0ljb24gPSBjb2x1bW4ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5TdGF0dXNJY29uJyk7XG4gICAgaWYgKHN0YXR1c0ljb24pIHtcbiAgICAgIHN0YXR1c0ljb24udGl0bGUgPSAnJztcbiAgICAgIHN0YXR1c0ljb24uc3R5bGUuY3Vyc29yID0gJyc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZUNvbHVtblN0YXRlKGluZGV4OiBudW1iZXIsIGlzQ29sbGFwc2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3Qga2V5ID0gYGJhY2tsb2dfY29sdW1uXyR7aW5kZXh9XyR7d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lfWA7XG4gICAgdHJ5IHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtrZXldOiBpc0NvbGxhcHNlZCB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNhdmUgY29sdW1uIHN0YXRlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZXN0b3JlQ29sdW1uU3RhdGUoY29sdW1uOiBIVE1MRWxlbWVudCwgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGtleSA9IGBiYWNrbG9nX2NvbHVtbl8ke2luZGV4fV8ke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX1gO1xuICAgIHRyeSB7XG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoa2V5LCByZXN1bHQgPT4ge1xuICAgICAgICBpZiAocmVzdWx0W2tleV0pIHtcbiAgICAgICAgICBjb25zdCBlbGVtZW50cyA9IGdldENvbHVtbkVsZW1lbnRzKGNvbHVtbik7XG4gICAgICAgICAgY29sbGFwc2VDb2x1bW4oY29sdW1uLCBidXR0b24sIGVsZW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byByZXN0b3JlIGNvbHVtbiBzdGF0ZTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb2JzZXJ2ZUNoYW5nZXMoKTogdm9pZCB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgICAgbXV0YXRpb25zLmZvckVhY2gobXV0YXRpb24gPT4ge1xuICAgICAgICBpZiAobXV0YXRpb24udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcbiAgICAgICAgICBpZiAoaXNCb2FyZFBhZ2UoKSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChhZGRDb2xsYXBzZUJ1dHRvbnMsIENPTkZJRy5CVVRUT05fREVMQVkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBleHBhbmRBbGxDb2x1bW5zKCk6IHZvaWQge1xuICAgIGNvbnN0IHN0YXR1c0NvbHVtbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNzcy1ocnBsdG4tY29sJyk7XG4gICAgc3RhdHVzQ29sdW1ucy5mb3JFYWNoKChjb2x1bW4sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBidXR0b24gPSBjb2x1bW4ucXVlcnlTZWxlY3RvcjxIVE1MQnV0dG9uRWxlbWVudD4oJy5jb2xsYXBzZS1idXR0b24nKTtcbiAgICAgIGlmIChidXR0b24gJiYgYnV0dG9uLmlubmVySFRNTCA9PT0gJ+KWticpIHtcbiAgICAgICAgdG9nZ2xlQ29sdW1uKGNvbHVtbiwgYnV0dG9uLCBpbmRleCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjb2xsYXBzZUFsbENvbHVtbnMoKTogdm9pZCB7XG4gICAgY29uc3Qgc3RhdHVzQ29sdW1ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuY3NzLWhycGx0bi1jb2wnKTtcbiAgICBzdGF0dXNDb2x1bW5zLmZvckVhY2goKGNvbHVtbiwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGJ1dHRvbiA9IGNvbHVtbi5xdWVyeVNlbGVjdG9yPEhUTUxCdXR0b25FbGVtZW50PignLmNvbGxhcHNlLWJ1dHRvbicpO1xuICAgICAgaWYgKGJ1dHRvbiAmJiBidXR0b24uaW5uZXJIVE1MID09PSAn4pa8Jykge1xuICAgICAgICB0b2dnbGVDb2x1bW4oY29sdW1uLCBidXR0b24sIGluZGV4KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldHVwS2V5Ym9hcmRTaG9ydGN1dHMoKTogdm9pZCB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZS5jdHJsS2V5ICYmIGUuc2hpZnRLZXkgJiYgZS5rZXkgPT09ICdFJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV4cGFuZEFsbENvbHVtbnMoKTtcbiAgICAgIH1cbiAgICAgIGlmIChlLmN0cmxLZXkgJiYgZS5zaGlmdEtleSAmJiBlLmtleSA9PT0gJ0MnKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29sbGFwc2VBbGxDb2x1bW5zKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KCk6IHZvaWQge1xuICAgIGlmIChpc0JvYXJkUGFnZSgpKSB7XG4gICAgICBzZXRUaW1lb3V0KGFkZENvbGxhcHNlQnV0dG9ucywgQ09ORklHLklOSVRfREVMQVkpO1xuICAgICAgc2V0dXBLZXlib2FyZFNob3J0Y3V0cygpO1xuICAgIH1cbiAgICBvYnNlcnZlQ2hhbmdlcygpO1xuICB9XG5cbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0KTtcbiAgfSBlbHNlIHtcbiAgICBpbml0KCk7XG4gIH1cbn0pKCk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkNBZ0JDLE1BQVk7QUFHWCxRQUFNLFNBQWlCO0FBQUEsSUFDckIsaUJBQWlCO0FBQUEsSUFDakIsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLEVBQUE7QUFHZCxXQUFTLGNBQXVCO0FBQzlCLFdBQU8sT0FBTyxTQUFTLFNBQVMsU0FBUyxTQUFTO0FBQUEsRUFDcEQ7QUFFQSxXQUFTLHFCQUEyQjtBQUNsQyxVQUFNLGdCQUFnQixTQUFTLGlCQUE4Qixp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

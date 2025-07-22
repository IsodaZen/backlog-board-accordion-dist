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
      addIssueButton: column.querySelector(".css-oslcxi-row")
    };
  }
  function expandColumn(column, button, elements) {
    if (elements.issueList) elements.issueList.style.display = "";
    if (elements.statusName) elements.statusName.style.display = "";
    if (elements.expandArea) elements.expandArea.style.display = "";
    if (elements.addIssueButton) elements.addIssueButton.style.display = "";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnRlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQmFja2xvZyBCb2FyZCBFbmhhbmNlciAtIENvbnRlbnQgU2NyaXB0IChUeXBlU2NyaXB0IFZlcnNpb24pXG5cbmludGVyZmFjZSBDb25maWcge1xuICBDT0xMQVBTRURfV0lEVEg6IHN0cmluZztcbiAgQlVUVE9OX0RFTEFZOiBudW1iZXI7XG4gIElOSVRfREVMQVk6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIENvbHVtbkVsZW1lbnRzIHtcbiAgaXNzdWVMaXN0OiBIVE1MRWxlbWVudCB8IG51bGw7XG4gIHN0YXR1c05hbWU6IEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgZXhwYW5kQXJlYTogSFRNTEVsZW1lbnQgfCBudWxsO1xuICBhZGRJc3N1ZUJ1dHRvbjogSFRNTEVsZW1lbnQgfCBudWxsO1xufVxuXG4oKCkgPT4ge1xuICAndXNlIHN0cmljdCc7XG5cbiAgY29uc3QgQ09ORklHOiBDb25maWcgPSB7XG4gICAgQ09MTEFQU0VEX1dJRFRIOiAnNzJweCcsXG4gICAgQlVUVE9OX0RFTEFZOiA1MDAsXG4gICAgSU5JVF9ERUxBWTogMTAwMFxuICB9O1xuXG4gIGZ1bmN0aW9uIGlzQm9hcmRQYWdlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5jbHVkZXMoJy9ib2FyZC8nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZENvbGxhcHNlQnV0dG9ucygpOiB2b2lkIHtcbiAgICBjb25zdCBzdGF0dXNDb2x1bW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jc3MtaHJwbHRuLWNvbCcpO1xuXG4gICAgc3RhdHVzQ29sdW1ucy5mb3JFYWNoKChjb2x1bW4sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBzdGF0dXNSb3cgPSBjb2x1bW4ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jc3MtdWp6Y2s0LXJvdycpO1xuICAgICAgaWYgKCFzdGF0dXNSb3cgfHwgc3RhdHVzUm93LnF1ZXJ5U2VsZWN0b3IoJy5jb2xsYXBzZS1idXR0b24nKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBjb2xsYXBzZUJ1dHRvbiA9IGNyZWF0ZUNvbGxhcHNlQnV0dG9uKGNvbHVtbiwgaW5kZXgpO1xuXG4gICAgICBjb25zdCBoZWFkZXIgPSBzdGF0dXNSb3cucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJ2gzLlNsb3RIZWFkJyk7XG4gICAgICBpZiAoaGVhZGVyKSB7XG4gICAgICAgIGhlYWRlci5hcHBlbmRDaGlsZChjb2xsYXBzZUJ1dHRvbik7XG4gICAgICB9XG5cbiAgICAgIHJlc3RvcmVDb2x1bW5TdGF0ZShjb2x1bW4sIGNvbGxhcHNlQnV0dG9uLCBpbmRleCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDb2xsYXBzZUJ1dHRvbihjb2x1bW46IEhUTUxFbGVtZW50LCBpbmRleDogbnVtYmVyKTogSFRNTEJ1dHRvbkVsZW1lbnQge1xuICAgIGNvbnN0IGNvbGxhcHNlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgY29sbGFwc2VCdXR0b24uY2xhc3NOYW1lID0gJ2NvbGxhcHNlLWJ1dHRvbic7XG4gICAgY29sbGFwc2VCdXR0b24uaW5uZXJIVE1MID0gJ+KWvCc7XG4gICAgY29sbGFwc2VCdXR0b24udGl0bGUgPSAn44K544OG44O844K/44K55YiX44KS5oqY44KK44Gf44Gf44KAJztcblxuICAgIGNvbGxhcHNlQnV0dG9uLnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgcGFkZGluZzogMnB4IDRweDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQtY29sb3IgMC4ycztcbiAgICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcbiAgICAgIG1hcmdpbi1sZWZ0OiA0cHg7XG4gICAgYDtcblxuICAgIGNvbGxhcHNlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgICBjb2xsYXBzZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2YwZjBmMCc7XG4gICAgfSk7XG5cbiAgICBjb2xsYXBzZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgY29sbGFwc2VCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50JztcbiAgICB9KTtcblxuICAgIGNvbGxhcHNlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB0b2dnbGVDb2x1bW4oY29sdW1uLCBjb2xsYXBzZUJ1dHRvbiwgaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbGxhcHNlQnV0dG9uO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlQ29sdW1uKGNvbHVtbjogSFRNTEVsZW1lbnQsIGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IGdldENvbHVtbkVsZW1lbnRzKGNvbHVtbik7XG4gICAgaWYgKCFlbGVtZW50cy5pc3N1ZUxpc3QpIHJldHVybjtcblxuICAgIGNvbnN0IGlzQ29sbGFwc2VkID0gZWxlbWVudHMuaXNzdWVMaXN0LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJztcblxuICAgIGNvbnNvbGUubG9nKFwidG9nZ2xlQ29sdW1uKCkgaXNDb2xsYXBzZWQgPVwiLCBpc0NvbGxhcHNlZCk7XG5cbiAgICBpZiAoaXNDb2xsYXBzZWQpIHtcbiAgICAgIGV4cGFuZENvbHVtbihjb2x1bW4sIGJ1dHRvbiwgZWxlbWVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb2xsYXBzZUNvbHVtbihjb2x1bW4sIGJ1dHRvbiwgZWxlbWVudHMpO1xuICAgIH1cblxuICAgIHNhdmVDb2x1bW5TdGF0ZShpbmRleCwgIWlzQ29sbGFwc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENvbHVtbkVsZW1lbnRzKGNvbHVtbjogSFRNTEVsZW1lbnQpOiBDb2x1bW5FbGVtZW50cyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzc3VlTGlzdDogY29sdW1uLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCd1bC5TbG90Qm94JyksXG4gICAgICBzdGF0dXNOYW1lOiBjb2x1bW4ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJ2gzLlNsb3RIZWFkID4gZGl2Om50aC1jaGlsZCgyKScpLFxuICAgICAgZXhwYW5kQXJlYTogY29sdW1uLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCdoMy5TbG90SGVhZCA+IGRpdjpudGgtY2hpbGQoMyknKSxcbiAgICAgIGFkZElzc3VlQnV0dG9uOiBjb2x1bW4ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jc3Mtb3NsY3hpLXJvdycpXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4cGFuZENvbHVtbihjb2x1bW46IEhUTUxFbGVtZW50LCBidXR0b246IEhUTUxCdXR0b25FbGVtZW50LCBlbGVtZW50czogQ29sdW1uRWxlbWVudHMpOiB2b2lkIHtcbiAgICBpZiAoZWxlbWVudHMuaXNzdWVMaXN0KSBlbGVtZW50cy5pc3N1ZUxpc3Quc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIGlmIChlbGVtZW50cy5zdGF0dXNOYW1lKSBlbGVtZW50cy5zdGF0dXNOYW1lLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICBpZiAoZWxlbWVudHMuZXhwYW5kQXJlYSkgZWxlbWVudHMuZXhwYW5kQXJlYS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgaWYgKGVsZW1lbnRzLmFkZElzc3VlQnV0dG9uKSBlbGVtZW50cy5hZGRJc3N1ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XG5cbiAgICBidXR0b24uaW5uZXJIVE1MID0gJ+KWvCc7XG4gICAgYnV0dG9uLnRpdGxlID0gJ+OCueODhuODvOOCv+OCueWIl+OCkuaKmOOCiuOBn+OBn+OCgCc7XG5cbiAgICBjb2x1bW4uc3R5bGUud2lkdGggPSAnJztcbiAgICBjb2x1bW4uc3R5bGUubWluV2lkdGggPSAnJztcbiAgICBjb2x1bW4uc3R5bGUubWF4V2lkdGggPSAnJztcbiAgICBcbiAgICAvLyBwYWRkaW5nLXJpZ2h044KS5YWD44Gr5oi744GZXG4gICAgY29sdW1uLnN0eWxlLnBhZGRpbmdSaWdodCA9ICcnO1xuXG4gICAgY29uc3QgZmlyc3RDaGlsZCA9IGNvbHVtbi5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudDtcbiAgICBpZiAoZmlyc3RDaGlsZCkge1xuICAgICAgZmlyc3RDaGlsZC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICB9XG5cbiAgICByZW1vdmVJY29uVG9vbHRpcChjb2x1bW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gY29sbGFwc2VDb2x1bW4oY29sdW1uOiBIVE1MRWxlbWVudCwgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCwgZWxlbWVudHM6IENvbHVtbkVsZW1lbnRzKTogdm9pZCB7XG4gICAgaWYgKGVsZW1lbnRzLmlzc3VlTGlzdCkgZWxlbWVudHMuaXNzdWVMaXN0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWYgKGVsZW1lbnRzLnN0YXR1c05hbWUpIGVsZW1lbnRzLnN0YXR1c05hbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAoZWxlbWVudHMuZXhwYW5kQXJlYSkgZWxlbWVudHMuZXhwYW5kQXJlYS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGlmIChlbGVtZW50cy5hZGRJc3N1ZUJ1dHRvbikgZWxlbWVudHMuYWRkSXNzdWVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgIGJ1dHRvbi5pbm5lckhUTUwgPSAn4pa2JztcbiAgICBidXR0b24udGl0bGUgPSAn44K544OG44O844K/44K55YiX44KS5bGV6ZaL44GZ44KLJztcblxuICAgIGNvbHVtbi5zdHlsZS53aWR0aCA9IENPTkZJRy5DT0xMQVBTRURfV0lEVEg7XG4gICAgY29sdW1uLnN0eWxlLm1pbldpZHRoID0gQ09ORklHLkNPTExBUFNFRF9XSURUSDtcbiAgICBjb2x1bW4uc3R5bGUubWF4V2lkdGggPSBDT05GSUcuQ09MTEFQU0VEX1dJRFRIO1xuXG4gICAgLy8g5pyA5b6M44Gu5YiX44Gu5aC05ZCI44CBcGFkZGluZy1yaWdodOOCkueEoeWKueWMllxuICAgIGlmIChjb2x1bW4ubWF0Y2hlcygnLmNzcy1ocnBsdG4tY29sOmxhc3Qtb2YtdHlwZScpKSB7XG4gICAgICBjb2x1bW4uc3R5bGUucGFkZGluZ1JpZ2h0ID0gJzAnO1xuICAgIH1cblxuICAgIGNvbnN0IGZpcnN0Q2hpbGQgPSBjb2x1bW4uZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgaWYgKGZpcnN0Q2hpbGQpIHtcbiAgICAgIGZpcnN0Q2hpbGQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgIH1cblxuICAgIGFkZEljb25Ub29sdGlwKGNvbHVtbiwgZWxlbWVudHMpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkSWNvblRvb2x0aXAoY29sdW1uOiBIVE1MRWxlbWVudCwgZWxlbWVudHM6IENvbHVtbkVsZW1lbnRzKTogdm9pZCB7XG4gICAgY29uc3Qgc3RhdHVzSWNvbiA9IGNvbHVtbi5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLlN0YXR1c0ljb24nKTtcbiAgICBpZiAoc3RhdHVzSWNvbiAmJiBlbGVtZW50cy5zdGF0dXNOYW1lKSB7XG4gICAgICBjb25zdCBzdGF0dXNUZXh0ID0gZWxlbWVudHMuc3RhdHVzTmFtZS50ZXh0Q29udGVudD8udHJpbSgpIHx8ICcnO1xuICAgICAgc3RhdHVzSWNvbi50aXRsZSA9IHN0YXR1c1RleHQ7XG4gICAgICBzdGF0dXNJY29uLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVJY29uVG9vbHRpcChjb2x1bW46IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3Qgc3RhdHVzSWNvbiA9IGNvbHVtbi5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLlN0YXR1c0ljb24nKTtcbiAgICBpZiAoc3RhdHVzSWNvbikge1xuICAgICAgc3RhdHVzSWNvbi50aXRsZSA9ICcnO1xuICAgICAgc3RhdHVzSWNvbi5zdHlsZS5jdXJzb3IgPSAnJztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlQ29sdW1uU3RhdGUoaW5kZXg6IG51bWJlciwgaXNDb2xsYXBzZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjb25zdCBrZXkgPSBgYmFja2xvZ19jb2x1bW5fJHtpbmRleH1fJHt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9YDtcbiAgICB0cnkge1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgW2tleV06IGlzQ29sbGFwc2VkIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBjb2x1bW4gc3RhdGU6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc3RvcmVDb2x1bW5TdGF0ZShjb2x1bW46IEhUTUxFbGVtZW50LCBidXR0b246IEhUTUxCdXR0b25FbGVtZW50LCBpbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3Qga2V5ID0gYGJhY2tsb2dfY29sdW1uXyR7aW5kZXh9XyR7d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lfWA7XG4gICAgdHJ5IHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChrZXksIChyZXN1bHQpID0+IHtcbiAgICAgICAgaWYgKHJlc3VsdFtrZXldKSB7XG4gICAgICAgICAgY29uc3QgZWxlbWVudHMgPSBnZXRDb2x1bW5FbGVtZW50cyhjb2x1bW4pO1xuICAgICAgICAgIGNvbGxhcHNlQ29sdW1uKGNvbHVtbiwgYnV0dG9uLCBlbGVtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcmVzdG9yZSBjb2x1bW4gc3RhdGU6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9ic2VydmVDaGFuZ2VzKCk6IHZvaWQge1xuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgICAgbXV0YXRpb25zLmZvckVhY2goKG11dGF0aW9uKSA9PiB7XG4gICAgICAgIGlmIChtdXRhdGlvbi50eXBlID09PSAnY2hpbGRMaXN0Jykge1xuICAgICAgICAgIGlmIChpc0JvYXJkUGFnZSgpKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGFkZENvbGxhcHNlQnV0dG9ucywgQ09ORklHLkJVVFRPTl9ERUxBWSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgc3VidHJlZTogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZXhwYW5kQWxsQ29sdW1ucygpOiB2b2lkIHtcbiAgICBjb25zdCBzdGF0dXNDb2x1bW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jc3MtaHJwbHRuLWNvbCcpO1xuICAgIHN0YXR1c0NvbHVtbnMuZm9yRWFjaCgoY29sdW1uLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgYnV0dG9uID0gY29sdW1uLnF1ZXJ5U2VsZWN0b3I8SFRNTEJ1dHRvbkVsZW1lbnQ+KCcuY29sbGFwc2UtYnV0dG9uJyk7XG4gICAgICBpZiAoYnV0dG9uICYmIGJ1dHRvbi5pbm5lckhUTUwgPT09ICfilrYnKSB7XG4gICAgICAgIHRvZ2dsZUNvbHVtbihjb2x1bW4sIGJ1dHRvbiwgaW5kZXgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY29sbGFwc2VBbGxDb2x1bW5zKCk6IHZvaWQge1xuICAgIGNvbnN0IHN0YXR1c0NvbHVtbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNzcy1ocnBsdG4tY29sJyk7XG4gICAgc3RhdHVzQ29sdW1ucy5mb3JFYWNoKChjb2x1bW4sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBidXR0b24gPSBjb2x1bW4ucXVlcnlTZWxlY3RvcjxIVE1MQnV0dG9uRWxlbWVudD4oJy5jb2xsYXBzZS1idXR0b24nKTtcbiAgICAgIGlmIChidXR0b24gJiYgYnV0dG9uLmlubmVySFRNTCA9PT0gJ+KWvCcpIHtcbiAgICAgICAgdG9nZ2xlQ29sdW1uKGNvbHVtbiwgYnV0dG9uLCBpbmRleCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXR1cEtleWJvYXJkU2hvcnRjdXRzKCk6IHZvaWQge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGUuY3RybEtleSAmJiBlLnNoaWZ0S2V5ICYmIGUua2V5ID09PSAnRScpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBleHBhbmRBbGxDb2x1bW5zKCk7XG4gICAgICB9XG4gICAgICBpZiAoZS5jdHJsS2V5ICYmIGUuc2hpZnRLZXkgJiYgZS5rZXkgPT09ICdDJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbGxhcHNlQWxsQ29sdW1ucygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpOiB2b2lkIHtcbiAgICBpZiAoaXNCb2FyZFBhZ2UoKSkge1xuICAgICAgc2V0VGltZW91dChhZGRDb2xsYXBzZUJ1dHRvbnMsIENPTkZJRy5JTklUX0RFTEFZKTtcbiAgICAgIHNldHVwS2V5Ym9hcmRTaG9ydGN1dHMoKTtcbiAgICB9XG4gICAgb2JzZXJ2ZUNoYW5nZXMoKTtcbiAgfVxuXG4gIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG4gIH0gZWxzZSB7XG4gICAgaW5pdCgpO1xuICB9XG59KSgpOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQ0FlQyxNQUFNO0FBR0wsUUFBTSxTQUFpQjtBQUFBLElBQ3JCLGlCQUFpQjtBQUFBLElBQ2pCLGNBQWM7QUFBQSxJQUNkLFlBQVk7QUFBQSxFQUFBO0FBR2QsV0FBUyxjQUF1QjtBQUM5QixXQUFPLE9BQU8sU0FBUyxTQUFTLFNBQVMsU0FBUztBQUFBLEVBQ3BEO0FBRUEsV0FBUyxxQkFBMkI7QUFDbEMsVUFBTSxnQkFBZ0IsU0FBUyxpQkFBOEIsaUJBQWlCO0FBRTlFLGtCQUFjLFFBQVEsQ0FBQyxRQUFRLFVBQVU7QUFDdkMsWUFBTSxZQUFZLE9BQU8sY0FBMkIsaUJBQWlCO0FBQ3JFLFVBQUksQ0FBQyxhQUFhLFVBQVUsY0FBYyxrQkFBa0IsRUFBRztBQUUvRCxZQUFNLGlCQUFpQixxQkFBcUIsUUFBUSxLQUFLO0FBRXpELFlBQU0sU0FBUyxVQUFVLGNBQTJCLGFBQWE7QUFDakUsVUFBSSxRQUFRO0FBQ1YsZUFBTyxZQUFZLGNBQWM7QUFBQSxNQUNuQztBQUVBLHlCQUFtQixRQUFRLGdCQUFnQixLQUFLO0FBQUEsSUFDbEQsQ0FBQztBQUFBLEVBQ0g7QUFFQSxXQUFTLHFCQUFxQixRQUFxQixPQUFrQztBQUNuRixVQUFN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

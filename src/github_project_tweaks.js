/**
 * Activate Work-in-Progress-limits on board columns.
 */
function activateWipLimit() {
  /** This regular expression finds the WiP limit in the column description */
  const wipLimitRegExp = /≤ *(\d+)/;
  const boardColumnXPath = '//*[@data-board-column]';
  const relativeItemCounterXPath = './/*[@data-testid="column-items-counter"]';

  markInitialColumns();
  observeColumns();

  /**
   * Mark columns where the column is already exceeded when the page is loaded.
   */
  function markInitialColumns() {
    const columnsSnapshot = getAllBoardColumnsAsSnapshot();
    let columnNode;

    for (let i = 0; i < columnsSnapshot.snapshotLength; ++i) {
      columnNode = columnsSnapshot.snapshotItem(i);
      const counterNode = getChildElementByXpath(columnNode, relativeItemCounterXPath);
      runInitialWipCheck(counterNode);
    }

    /**
     * Get all columns of the board as a snapshot (so that mutations are allowed).
     *
     * @returns {XPathResult} all board columns
     */
    function getAllBoardColumnsAsSnapshot() {
      return document.evaluate(boardColumnXPath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    }

    /**
     * Runs the initial WiP check.
     * When opening a board, columns can already have more items than they should have considering the WiP limit.
     *
     * @param {Node} counterNode - counter node of the column that needs to be checked
     */
    function runInitialWipCheck(counterNode) {
      checkItemCounter(counterNode, parseInt(counterNode.textContent));
    }
  }

  /**
   * Observe columns for item count changes.
   */
  function observeColumns() {
    const callbackOnChangedItemCount = (mutationList, _) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'characterData') {
          const counterNode = mutation.target.parentNode;
          const newCounterValue = mutation.target.textContent;
          checkItemCounter(counterNode, newCounterValue);
        }
      }
    };

    const observer = new MutationObserver(callbackOnChangedItemCount);
    const columnIterator = getAllBoardColumnsAsIterator();
    let columnNode = columnIterator.iterateNext();

    while (columnNode) {
      const counterNode = getChildElementByXpath(columnNode, relativeItemCounterXPath);
      observer.observe(counterNode, { characterData: true, subtree: true });
      columnNode = columnIterator.iterateNext();
    }

    /**
     * Gets a list of all columns on a board page.
     *
     * @returns {XPathResult} list of board column nodes
     */
    function getAllBoardColumnsAsIterator() {
      return document.evaluate(boardColumnXPath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    }
  }

  /**
   * Gets the child element of a document node by its XPath.
   *
   * @param {Node} parentNode - document node from which the search starts
   * @param {string} path - relative XPath
   * @returns {Node} node at path
   */
  function getChildElementByXpath(parentNode, path) {
    return document.evaluate(path, parentNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

  /**
   * Checks the value in the item counter and compare it with the WiP limit.
   * If the WiP limit is exceeded, highlights the offending column on the Kanban board.
   * Otherwise, resets the style to the default.
   *
   * @param {Node} counterNode - document node that holds the counter value
   * @param {number} newCounterValue - value the counter changed to when the observer was triggered
   */
  function checkItemCounter(counterNode, newCounterValue) {
    const parentColumnNode = counterNode.parentNode.parentNode.parentNode.parentNode;
    const wipLimit = parseWipLimit(parentColumnNode);
    if (wipLimit > 0) {
      if (newCounterValue > wipLimit) {
        highlightExceededWip(parentColumnNode, counterNode);
      } else {
        resetStyle(parentColumnNode, counterNode);
      }
    }
  }

  /**
   * Reads the value of the WiP limit from the description field of the board column.
   *
   * @param {Node} columnNode - document node that represents a column on the board
   * @returns {number} limit in number of tickets if a limit exists, 0 otherwise
   */
  function parseWipLimit(columnNode) {
    const columnDescriptionNode = getChildElementByXpath(columnNode, './span');
    const columnDescription = columnDescriptionNode.textContent;
    const match = columnDescription.match(wipLimitRegExp);
    if (match) {
      return parseInt(match[1]);
    } else {
      return 0;
    }
  }

  /**
   * Highlights a board column including its item counter.
   *
   * @param {Node} columnNode - document node that represents the column on the board
   * @param {Node} counterNode - document node that represents the item counter
   */
  function highlightExceededWip(columnNode, counterNode) {
    counterNode.style.backgroundColor = 'red';
    counterNode.style.color = 'white';
    columnNode.style.border = '5px solid red';
  }

  /**
   * Resets the style of a board column.
   * The original column does not have an element style. The default style is set via CSS class.
   * So deleting the element style resets the column to its original look.
   *
   * @param {Node} columnNode - document node that represents the column on the board
   * @param {Node} counterNode - document node that represents the item counter
   */
  function resetStyle(columnNode, counterNode) {
    counterNode.style.backgroundColor = null;
    counterNode.style.color = null;
    columnNode.style.border = null;
  }
}

/**
 * Add the logic that makes durations more readable.
 * When durations are stored as floating point values in days, this helper adds a more user-friendly notation.
 * For example the number 17.25 is displayed as "2w 2d 2h".
 */
function activateDurationHelper() {
  const workingHoursPerDay = 8;
  const workingDaysPerWeek = 5;
  const durationCellXPath = './/div[contains(@data-testid, "TableCell") and contains(@data-testid, "Actual Effort")]';

  annotateInitialDurationCells();
  observeDurationCells();

  /**
   * Go through the initial duration table cells and add the user-friendly notation when the page first is loaded.
   */
  function annotateInitialDurationCells() {
    const durationCells = getAllDurationCellsAsSnapshot();
    let durationNode;
    for (let i = 0; i < durationCells.snapshotLength; ++i) {
      durationNode = durationCells.snapshotItem(i);
      setDurationHoverText(durationNode, durationNode.firstChild.firstChild.textContent);
    }

    /**
     * Get all duration table cells as snapshot (so that mutation is allowed).
     *
     * @returns {XPathResult} all duration cells
     */
    function getAllDurationCellsAsSnapshot() {
      return document.evaluate(durationCellXPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    }
  }

  /**
   * Observe the table cells that contain durations to update the user-friendly notation when the values change.
   */
  function observeDurationCells() {
    const callbackOnChangedDuration = (mutationList, _) => {
      for (const mutation of mutationList) {
        const target = mutation.target;
        if (target.hasAttribute('data-testid') && target.getAttribute('data-testid'.includes('Actual Effort'))) {
          const newDurationValue = target.textContent;
          setDurationHoverText(target, newDurationValue);
        }
      }
    };

    const observer = new MutationObserver(callbackOnChangedDuration);
    const observableDurations = getAllDurationCellsAsIterator();
    let durationNode = observableDurations.iterateNext();

    while (durationNode) {
      // Since the cell is replaced with an input field, we need to listen for mutations on the row.
      observer.observe(durationNode.parentNode, { characterData: true, subtree: true, childList: true });
      durationNode = observableDurations.iterateNext();
    }

    /**
     * Get the duration table cells as iterator.
     *
     * @returns {XPathResult} all duration cells
     */
    function getAllDurationCellsAsIterator() {
      return document.evaluate(durationCellXPath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    }
  }

  /**
   * Sets the hover text (aka. "title" attribute) of the duration cell.
   *
   * @param {Node} durationNode - node on which to set the title
   * @param {string} duration - duration in days
   */
  function setDurationHoverText(durationNode, duration) {
    const totalDays = parseFloat(duration);
    const userFriendlyDuration = formatDuration(totalDays);
    requestAnimationFrame(() => { durationNode.title = userFriendlyDuration; });
  }

  /**
   * Formats a duration in a user-friendly way (e.g. "4w 2d 7h").
   *
   * @param {number} totalDays - duration in days as floating point number
   * @returns {string} weeks, days and hours
   */
  function formatDuration(totalDays) {
    const fullDays = Math.trunc(totalDays);
    const weeks = Math.floor(fullDays / workingDaysPerWeek);
    const days = Math.floor(fullDays % workingDaysPerWeek);
    const hours = (totalDays - fullDays) * workingHoursPerDay;
    return (weeks > 0 ? (weeks + 'w') : '')
      .concat(' ', (days > 0 ? (days + 'd') : ''))
      .concat(' ', (hours > 0 ? (hours + 'h') : ''));
  }
}

activateWipLimit();
activateDurationHelper();

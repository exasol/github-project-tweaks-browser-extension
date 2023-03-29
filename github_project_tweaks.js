activateWipLimit();

/**
 * Activate Work-in-Progress-limits on board columns.
 */
function activateWipLimit() {
  // This regular expression finds the WiP limit in the column description:
  const wipLimitRegExp = /≤ *(\d+)/;
  const boardColumnXPath = '//*[@data-board-column]';
  const relativeItemCounterXPath = './/*[@data-testid="column-items-counter"]';

  /** Configuration for observing the character data in the text content that changes below the item counter. */
  const itemCountObserverConfig = { characterData: true, subtree: true };

  const callbackOnChangedItemCount = (mutationList, _) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'characterData') {
        const counterNode = mutation.target.parentNode;
        const newCounterValue = mutation.target.textContent;
        checkItemCounter(counterNode, newCounterValue);
      }
    }
  };

  const columnIterator = getAllBoardColumns();
  let columnNode = columnIterator.iterateNext();

  while (columnNode) {
    const counterNode = getChildElementByXpath(columnNode, relativeItemCounterXPath);
    const observer = new MutationObserver(callbackOnChangedItemCount);
    observer.observe(counterNode, itemCountObserverConfig);
    runInitialWipCheck(counterNode);
    columnNode = columnIterator.iterateNext();
  }

  /**
   * Gets a list of all columns on a board page.
   *
   * @returns {XPathResult} list of board column nodes
   */
  function getAllBoardColumns() {
    return document.evaluate(boardColumnXPath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
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
   * Runs the initial WiP check.
   * When opening a board, columns can already have more items than they should have considering the WiP limit.
   *
   * @param {Node} counterNode - counter node of the column that needs to be checked
   */
  function runInitialWipCheck(counterNode) {
    checkItemCounter(counterNode, parseInt(counterNode.textContent));
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

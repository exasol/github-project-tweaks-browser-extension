// This regular expression finds the WiP limit in the column description:
const wipLimitRegExp = new RegExp("≤ *([0-9]+)")
const boardColumnXPath = '//*[@data-board-column]'
const relativeItemCounterXPath = './/*[@data-testid="column-items-counter"]'

function getChildElementByXpath(parent, path) {
  return document.evaluate(path, parent, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function getElementByXpath(path) {
  return getChildElementByXpath(document, path);
}

function getAllBoardColumns() {
    return document.evaluate(boardColumnXPath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
}

function parseWipLimit(columnNode) {
    const columnDescriptionNode = getChildElementByXpath(columnNode, './span');
    const columnDescription = columnDescriptionNode.textContent;
    const match = columnDescription.match(wipLimitRegExp);
    if (match) {
        return match[1];
    } else {
        return 0
    }
}

// We want to observe the character data in the text content that changes below the item counter:
const itemCountObserverConfig = { characterData: true, subtree: true };

const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === "characterData") {
            const counterNode = mutation.target.parentNode;
            const newCounterValue = mutation.target.textContent;
            checkItemCounter(counterNode, newCounterValue)
        }
    }
};

function checkItemCounter(counterNode, newCounterValue) {
    const parentColumnNode = counterNode.parentNode.parentNode.parentNode.parentNode;
    const wipLimit = parseWipLimit(parentColumnNode);
    if (wipLimit > 0) {
        if(newCounterValue > wipLimit) {
            highlightExceededWip(parentColumnNode, counterNode)
        } else {
            resetStyle(parentColumnNode, counterNode)
        }
    }
}

function highlightExceededWip(columnNode, counterNode) {
    counterNode.style.backgroundColor = "red";
    counterNode.style.color = "white";
    columnNode.style.border = "5px solid red"
}

function resetStyle(columnNode, counterNode) {
    counterNode.style.backgroundColor = null;
    counterNode.style.color = null;
    columnNode.style.border = null;
}


function registerItemCountObservers() {
    const columnIterator = getAllBoardColumns();
    let columnNode = columnIterator.iterateNext();
    while (columnNode) {
        const counterNode = getChildElementByXpath(columnNode, relativeItemCounterXPath);
        const observer = new MutationObserver(callback);
        observer.observe(counterNode, itemCountObserverConfig)
        //checkItemCounter(counterNode, counterNode.textContent)
        columnNode = columnIterator.iterateNext();
    }
}

registerItemCountObservers()

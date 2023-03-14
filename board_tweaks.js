// This regular expression finds the WiP limit in the column description:
const wipLimitRegExp = new RegExp("≤ *([0-9]+)")

function getChildElementByXpath(parent, path) {
  return document.evaluate(path, parent, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function getElementByXpath(path) {
  return getChildElementByXpath(document, path)
}

function parseWipLimit(columnNode) {
    const columnDescriptionNode = getChildElementByXpath(columnNode, './span')
    const columnDescription = columnDescriptionNode.textContent
    return columnDescription.match(wipLimitRegExp)[1]
}

// We want to observe the character data in the text content that changes below the item counter:
const itemCountObserverConfig = { characterData: true, subtree: true };

const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === "characterData") {
            const counterNode = mutation.target.parentNode
            const newCounterValue = mutation.target.textContent
            const parentColumnNode = counterNode.parentNode.parentNode.parentNode.parentNode
            if(newCounterValue > parseWipLimit(parentColumnNode)) {
                counterNode.style.backgroundColor = "red";
                counterNode.style.color = "white";
                parentColumnNode.style.border = "5px solid red"
            } else {
                counterNode.style.backgroundColor = null;
                counterNode.style.color = null;
                parentColumnNode.style.border = "1px solid rgb(216, 222, 228)"
            }
        }
    }
};

document.body.style.border = "5px solid green";
const boardColumn = getElementByXpath('//*[@data-board-column="🔧 In Progress"]');
const itemsCounterNode = getChildElementByXpath(boardColumn, './/*[@data-testid="column-items-counter"]');

const observer = new MutationObserver(callback);
observer.observe(itemsCounterNode, itemCountObserverConfig)

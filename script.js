document.addEventListener("DOMContentLoaded", loadTable);
document.addEventListener("DOMContentLoaded", addTvShow);
document.addEventListener("DOMContentLoaded", deleteTvShow);
document.addEventListener("DOMContentLoaded", enableEdit);
document.addEventListener("DOMContentLoaded", editTvShow);

function makeCell(cellData, dataType, dataName, row) {
    const cell = document.createElement("td");
    const cellInput = document.createElement("input");
    cellInput.setAttribute("type", dataType);
    cellInput.setAttribute("name", dataName);
    cellInput.setAttribute("disabled", "");
    if (dataType === "number") {
        cellInput.setAttribute("min", 0);
    }
    if (dataType === "date") {
        let jsDate = cellData.slice(0, 10);
        cellInput.value = jsDate;
        cell.appendChild(cellInput);
        row.appendChild(cell);
        return;
    }
    cellInput.value = cellData;
    cell.appendChild(cellInput);
    row.appendChild(cell);
}

function makeRadioButton(cellData, row) {
    const cell = document.createElement("td");
    const form = document.createElement("form");
    const yesInput = document.createElement("input");
    yesInput.setAttribute("type", "radio");
    yesInput.setAttribute("id", "yes");
    yesInput.setAttribute("name", "ongoingSeries");
    yesInput.setAttribute("value", "0");
    yesInput.setAttribute("disabled", "");

    const yesLabel = document.createElement("label");
    yesLabel.setAttribute("for", "yes");
    yesLabel.textContent = "Yes";

    const noInput = document.createElement("input");
    noInput.setAttribute("type", "radio");
    noInput.setAttribute("id", "no");
    noInput.setAttribute("name", "ongoingSeries");
    noInput.setAttribute("value", "1");
    noInput.setAttribute("disabled", "");

    const noLabel = document.createElement("label");
    noLabel.setAttribute("for", "no");
    noLabel.textContent = "No";

    if (cellData === 0) {
        yesInput.setAttribute("checked", "");
    }
    else {
        noInput.setAttribute("checked", "");
    }

    cell.appendChild(form);
    form.appendChild(yesInput);
    form.appendChild(yesLabel);
    form.appendChild(noInput);
    form.appendChild(noLabel);
    row.appendChild(cell);
}

function makeButton(buttonName, buttonClass, row) {
    const button = document.createElement("button");
    button.setAttribute("class", buttonClass);
    button.textContent = buttonName;
    row.appendChild(button);
}

function loadTable() {
    const table = document.getElementById("tvShow-table");
    const tbody = document.createElement("tbody");
    tbody.setAttribute("id", "table-content");
    table.appendChild(tbody);
    const req = new XMLHttpRequest();
    req.open("GET", "https://gentle-waters-75179.herokuapp.com/", true);
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            const response = JSON.parse(req.responseText);
            response.rows.forEach(element => {
                const row = document.createElement("tr");
                makeCell(element._id, "hidden", "_id", row);
                makeCell(element.title, "text", "title", row);
                makeCell(element.season, "number", "season", row);
                makeCell(element.episode, "number", "episode", row);
                makeRadioButton(element.ongoingSeries, row);
                makeCell(element.dateLastWatched, "date", "dateLastWatched", row);
                makeButton("Edit", "editButton", row);
                makeButton("Delete", "deleteButton", row);
                tbody.appendChild(row);
            });
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send();
}

function clearTable() {
    document.getElementById("table-content").remove();
}

function addTvShow() {
    const form = document.getElementById("addForm");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const myData = { title: null, season: null, episode: null, ongoingSeries: null, dateLastWatched: null };
        myData.title = form.elements.title.value;
        myData.season = form.elements.season.value;
        myData.episode = form.elements.episode.value;
        myData.ongoingSeries = form.elements.ongoingSeries.value;
        myData.dateLastWatched = form.elements.dateLastWatched.value;
        form.elements.title.value = null;
        form.elements.season.value = null;
        form.elements.episode.value = null;
        form.elements.ongoingSeries.value = null;
        form.elements.dateLastWatched.value = null;
        const req = new XMLHttpRequest();
        req.open("POST", "https://gentle-waters-75179.herokuapp.com/", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.addEventListener("load", function () {
            if (req.status >= 200 && req.status < 400) {
                clearTable();
                loadTable();
            } else {
                console.log("Error in network request: " + req.statusText);
            }
        });
        req.send(JSON.stringify(myData));
    });
}

function deleteTvShow() {
    const table = document.getElementById("tvShow-table");
    table.addEventListener("click", function (event) {
        if (event.target.nodeName !== "BUTTON" || !event.target.classList.contains("deleteButton")) {
            return;
        }
        const rowId = event.target.parentNode.firstChild.firstChild.value;
        console.log(rowId);
        const myData = { _id: null };
        myData._id = rowId;
        const req = new XMLHttpRequest();
        req.open("DELETE", "https://gentle-waters-75179.herokuapp.com/", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.addEventListener("load", function () {
            if (req.status >= 200 && req.status < 400) {
                clearTable();
                loadTable();
            } else {
                console.log("Error in network request: " + req.statusText);
            }
        });
        req.send(JSON.stringify(myData));
    });
}

function enableEdit() {
    const table = document.getElementById("tvShow-table");
    table.addEventListener("click", function (event) {
        if (event.target.nodeName !== "BUTTON" || !event.target.classList.contains("editButton")) {
            return;
        }
        const parentRow = event.target.parentNode;
        for (let input = parentRow.firstChild; input !== null && input.nodeName !== "BUTTON"; input = input.nextSibling) {
            input.firstChild.removeAttribute("disabled");
        }
        parentRow.childNodes[4].firstChild.childNodes[0].removeAttribute("disabled");
        parentRow.childNodes[4].firstChild.childNodes[2].removeAttribute("disabled");

        event.target.nextSibling.remove();
        event.target.remove();

        const doneButton = document.createElement("button");
        doneButton.setAttribute("class", "doneButton");
        doneButton.textContent = "Done";
        parentRow.appendChild(doneButton);
    });
}

function editTvShow() {
    const table = document.getElementById("tvShow-table");
    table.addEventListener("click", function (event) {
        if (event.target.nodeName !== "BUTTON" || !event.target.classList.contains("doneButton")) {
            return;
        }
        const parentRow = event.target.parentNode;
        const rowId = parentRow.firstChild.firstChild.value;
        for (let input = parentRow.firstChild; input !== null && input.nodeName !== "BUTTON"; input = input.nextSibling) {
            input.firstChild.setAttribute("disabled", "");
        }
        parentRow.childNodes[4].firstChild.childNodes[0].setAttribute("disabled", "");
        parentRow.childNodes[4].firstChild.childNodes[2].setAttribute("disabled", "");

        const myData = { _id: null, title: null, season: null, episode: null, ongoingSeries: null, dateLastWatched: null };
        myData._id = rowId;
        const idCell = parentRow.firstChild;
        const titleCell = idCell.nextSibling;
        myData.title = titleCell.firstChild.value;
        const seasonCell = titleCell.nextSibling;
        myData.season = seasonCell.firstChild.value;
        const episodeCell = seasonCell.nextSibling;
        myData.episode = episodeCell.firstChild.value;
        const ongoingSeriesCell = episodeCell.nextSibling;
        const yesInput = ongoingSeriesCell.firstChild.childNodes[0];
        const noInput = ongoingSeriesCell.firstChild.childNodes[2];
        if (yesInput.checked) {
            myData.ongoingSeries = yesInput.value;
        }
        else {
            myData.ongoingSeries = noInput.value;
        }
        const dateCell = ongoingSeriesCell.nextSibling;
        myData.dateLastWatched = dateCell.firstChild.value;

        event.target.remove();

        const editButton = document.createElement("button");
        editButton.setAttribute("class", "editButton");
        editButton.textContent = "Edit";
        parentRow.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.setAttribute("class", "deleteButton");
        deleteButton.textContent = "Delete";
        parentRow.appendChild(deleteButton);

        const req = new XMLHttpRequest();
        req.open("PUT", "https://gentle-waters-75179.herokuapp.com/", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.addEventListener("load", function () {
            if (req.status >= 200 && req.status < 400) {
                clearTable();
                loadTable();
            } else {
                console.log("Error in network request: " + req.statusText);
            }
        });
        req.send(JSON.stringify(myData));
    });
}

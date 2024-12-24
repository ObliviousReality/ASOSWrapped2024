let nameList = new Array();
let userNameList = new Array();

let people = new Map();

var data;
var messageData;
var currentPerson;

var currentPage = 0;
const totalPages = 13;

class PersonIntPair {
    p;
    i;
    constructor(_person, _int) {
        this.p = _person;
        this.i = _int;
    }

    person() {
        return this.p;
    }

    realName() {
        return people.get(this.p).name;
    }

    int() {
        return this.i;
    }
}

class Person {
    name = "";
    username = "";
    joinDate = "";
    thisYearMessages = 0;
    totalMessages = 0;
    images = new Array();
    pinnedMessages = 0;
    imagesMessages = 0;

    mentions = new Map();

    constructor(username, jsonElement) {
        this.name = jsonElement["name"];
        this.username = username;
        this.joinDate = jsonElement["join-date"];
        jsonElement["image-links"].forEach(imageLink => {
            this.images.push(imageLink);
        });
        let msgData = messageData[username];
        this.thisYearMessages = msgData["sent"];
        this.totalMessages = msgData["total-sent"];
        this.pinnedMessages = msgData["pins"];
        this.imagesMessages = msgData["images"];

        userNameList.forEach(element => {
            this.mentions.set(element, msgData[element]);
        });

    }

    mostMentioned() {
        let mostUsername = "";
        let mostCount = 0;
        this.mentions.forEach(function (value, key) {
            if (value > mostCount) {
                mostUsername = key;
                mostCount = value;
            }
        });
        return new PersonIntPair(mostUsername, mostCount);
    }

    yearsOnDiscord() {
        let joinYear = this.joinDate.split("/")[2];
        let length = 2024 - joinYear;
        return appendNumberSuffix(length);
    }

    getMentionsCount() {
        let count = 0;
        console.log(this.mentions);

        for (let i = 0; i < userNameList.length; ++i) {
            count += this.mentions.get(userNameList[i]);
        }
        return count;
    }

    getMentionsComment() {
        for (let i = 0; i < userNameList.length; ++i) {
            if ((userNameList[i] != this.username) && this.mentions.get(userNameList[i]) == 0) {
                return "You didn't mention everyone this year :(";
            }
        }
        return "You mentioned everyone this year!";
    }

    getServerAgePos() {
        for (let i = 0; i < userNameList.length; ++i) {
            if (userNameList[i] == this.username) {
                return appendNumberSuffix(i + 1);
            }
        }
    }

    getMostMessagesThisYearIndex() {
        let index = 1;
        for (let i = 0; i < userNameList.length; ++i) {
            if (people.get(userNameList[i]).thisYearMessages > this.thisYearMessages) {
                index++;
            }
        }
        return appendNumberSuffix(index + 1);
    }

    getMostMessagesAllTimeIndex() {
        let index = 1;
        for (let i = 0; i < userNameList.length; ++i) {
            if (people.get(userNameList[i]).totalMessages > this.totalMessages) {
                index++;
            }
        }
        return appendNumberSuffix(index);
    }

    getMentionedSelf() {
        return this.mentions.get(this.username) > 0;
    }
}

function appendNumberSuffix(string) {
    switch (string) {
        case 1:
            return string + "st";
        case 2:
            return string + "nd";
        case 3:
            return string + "rd";

        default:
            return string + "th";
    }
}

function onSubmitPressed() {
    let ta = document.getElementById("nameBox");
    let text = ta.value;
    if (!text.length) {
        document.getElementById("status").innerText = "Type something!";
        return;
    }

    const lowerCaseText = text.toString().toLowerCase();
    if (lowerCaseText == "jonno") {
        text = "Jonathan";
    }
    else if (lowerCaseText == "ali") {
        text = "Alistair";
    }
    else if ((lowerCaseText == "matt") || (lowerCaseText == "matthew")) {
        text = "Dowdall";
    }
    else if (lowerCaseText == "doug") {
        text = "Douglas";
    }
    else if (lowerCaseText == "oliver") {
        text = "Oli";
    }
    else if (lowerCaseText == "mimi") {
        text = "Miya";
    }
    else if (lowerCaseText == "J") {
        text = "Jay";
    }

    if (nameList.find((item) => {
        return item.toString().toLowerCase() == text.toString().toLowerCase();
    })) {
        document.getElementById("status").innerText = "";
        text = String(text).charAt(0).toUpperCase() + String(text).slice(1);
        let idx = nameList.indexOf(text);
        currentPerson = people.get(userNameList[idx]);
        fillData();
        nextPage();
        document.getElementById("nPB").style.display = "block";
        document.getElementById("pPB").style.display = "block";
    }
    else if ((lowerCaseText == "humpmefuck") || (lowerCaseText == "hump me fuck")) {
        document.getElementById("status").innerText = "Really? Time to confess, I think";
    }
    else {
        document.getElementById("status").innerText = "Incorrect Name";
    }
}

function loadData() {
    var file = new XMLHttpRequest();
    file.open("GET", "data.json", true);
    file.onreadystatechange = () => {
        if (file.readyState == 4) {
            var rawText = file.responseText;
            data = JSON.parse(rawText);
            userNameList = Object.keys(data);
            Object.keys(data).forEach((item) => {
                nameList.push(data[item]["name"]);
            });
        }
    }
    file.send();

    var file2 = new XMLHttpRequest();
    file2.open("GET", "messageData.json", true);
    file2.onreadystatechange = () => {
        if (file2.readyState == 4) {
            var rawText = file2.responseText;
            messageData = JSON.parse(rawText);
            userNameList.forEach((username) => {
                let p = new Person(username, data[username]);
                people.set(username, p);
            });
        }
    }
    file2.send();
}

function replaceValuesWith(className, replaceText) {
    let elems = document.getElementsByClassName(className);
    for (let i = 0; i < elems.length; ++i) {
        let text = elems[i].innerText;
        elems[i].innerText = elems[i].innerText.replace("HERE", replaceText);
    }
}

function setCommentText(idName, comment) {
    let elem = document.getElementById(idName);
    elem.innerText = comment;
}

function fillData() {
    replaceValuesWith("fillName", currentPerson.name);
    replaceValuesWith("fillUsername", currentPerson.username);
    replaceValuesWith("fillThisYearMessages", currentPerson.thisYearMessages);
    replaceValuesWith("fillTotalMessages", currentPerson.totalMessages);
    const thisYearMessagePercent = Math.round((currentPerson.thisYearMessages / currentPerson.totalMessages) * 100 * 100) / 100 + '%';
    replaceValuesWith("fillPercentMessages", thisYearMessagePercent);
    replaceValuesWith("fillImageCountHere", currentPerson.imagesMessages);
    replaceValuesWith("fillTotalYearsHere", currentPerson.yearsOnDiscord());
    replaceValuesWith("fillJoinDateHere", currentPerson.joinDate);
    replaceValuesWith("fillServerAgePos", currentPerson.getServerAgePos());
    const pinnedMessages = currentPerson.pinnedMessages;
    replaceValuesWith("fillPinnedMessagesHere", pinnedMessages);
    const pinnedMessageComment = pinnedMessages > 0 ? "You must have said some important stuff!" : "Better luck next year!";
    setCommentText("pinnedMessagesComment", pinnedMessageComment)
    replaceValuesWith("fillTotalMentionsHere", currentPerson.getMentionsCount());
    setCommentText("mentionsComment", currentPerson.getMentionsComment());
    let mostMentioned = currentPerson.mostMentioned();
    replaceValuesWith("fillMostMentionedThisYear", mostMentioned.realName());
    replaceValuesWith("fillMostMentionedPersonCount", mostMentioned.int());
    const otherMostMentioned = people.get(mostMentioned.person()).mostMentioned();
    const mentionedEqualityComment = otherMostMentioned.person() == currentPerson.username
        ? mostMentioned.realName() + " mentioned you the most!"
        : mostMentioned.realName() + " mentioned someone else the most...";
    const mentionedEqualityComment2 = otherMostMentioned.person() == currentPerson.username
        ? "You must be in sync!"
        : "Their attention belongs to " + otherMostMentioned.realName();
    setCommentText("mentionedEqualityComment", mentionedEqualityComment);
    setCommentText("mentionedEqualityComment2", mentionedEqualityComment2);
    replaceValuesWith("fillThisYearMessagesIndex", currentPerson.getMostMessagesThisYearIndex());
    replaceValuesWith("fillTotalMessagesIndex", currentPerson.getMostMessagesAllTimeIndex());
    const mentionsPercent = Math.round((currentPerson.getMentionsCount() / currentPerson.thisYearMessages) * 100 * 100) / 100 + '%';
    replaceValuesWith("fillMentionsPercent", mentionsPercent);
    const selfMentionMessage = currentPerson.getMentionedSelf() ? "You mentioned yourself this year!" : "You didn't mention yourself this year - better luck in 2025!";
    setCommentText("mentionedYourselfComment", selfMentionMessage);

    showImage();
}

let imageIdx = 0;

function showImage() {
    const len = currentPerson.images.length;
    if (!len) {
        return;
    }
    let carousel = document.getElementsByClassName("carousel")[0];
    imageIdx++;
    if (imageIdx == len) {
        imageIdx = 0;
    }
    carousel.src = currentPerson.images[imageIdx];
    setTimeout(showImage, 5000);
}

function nextPage() {
    if (currentPage >= totalPages) {
        // end!
        return;
    }
    currentPage++;
    if (currentPage == totalPages) {
        // end!
        return;
    }
    for (let i = 0; i < totalPages; ++i) {
        let elem = document.getElementsByClassName("page" + i)[0];
        elem.style.display = "none";
    }
    let string = "page" + currentPage;
    console.log(string);

    let elem = document.getElementsByClassName(string)[0];
    elem.style.display = currentPage != 12 ? "block" : "flex";
}

function prevPage() {
    if (currentPage == 1) {
        // end!
        return;
    }
    currentPage--;
    for (let i = 0; i < totalPages; ++i) {
        let elem = document.getElementsByClassName("page" + i)[0];
        elem.style.display = "none";
    }
    let string = "page" + currentPage;
    console.log(string);

    let elem = document.getElementsByClassName(string)[0];
    elem.style.display = currentPage != 12 ? "block" : "flex";
}

function backToStart(params) {
    currentPage = 2;
    prevPage();
}

function onLoad() {
    loadData();
    for (let i = 1; i < totalPages; ++i) {
        let elem = document.getElementsByClassName("page" + i)[0];
        elem.style.display = "none";
    }
}


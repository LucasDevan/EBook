const languages = Object.freeze({
    ENGLISH: 0,
    FRENCH: 1,
});

const NUMBER_OF_ACTIVITIES = 10;
const NUMBER_OF_CHALLENGES = 4;


const activities_fr = [
    "Lire un chapitre",
    "Écrire un chapitre",
    "Dessiner",
    "Faire du sport",
    "Jouer d'un instrument",
    "Cuisiner",
    "Jouer à un jeu vidéo",
    "Sallonger et relaxer un peut",
    "Envoyer un message à un ami",
    "Trouver de meilleur activité pour cette liste"
];

const challenges_fr = [
    "Sans ta main gauche",
    "Avec un oeil fermé",
    "En comptant de 1 à 100",
    "En récitant l'alphabet à l'envers"
];

const activities_en = [
    "Read a chapter",
    "Write a chapter",
    "Draw",
    "Play sports",
    "Play a musical instrument",
    "Cook",
    "Play a video game",
    "Lie down and relax a bit",
    "Send a message to a friend",
    "Find better activities for this list"
];

const challenges_en = [
    "Without your left hand",
    "With one eye closed",
    "Counting from 1 to 100",
    "Reciting the alphabet backwards"
];

let selectedLanguage = languages.ENGLISH;

const activity = document.getElementById("activity");
const challenge = document.getElementById("challenge");

const frenchButton = document.getElementById("french");
const englishButton = document.getElementById("english");

const completedCountEl = document.getElementById("completedCount");
const failedCountEl = document.getElementById("failedCount");
const skipsCountEl = document.getElementById("skipsCount");
const completedCountText = document.getElementById("completedCountText");
const failedCountText = document.getElementById("failedCountText");
const skipCountText = document.getElementById("skipCountText");

const counterElement = document.getElementById("counters");

const hardModeTitle = document.getElementById("hardModeTitle");
const ChallengeGeneratorTitle = document.getElementById("Challenge-generator-title");

const hardModeButton = document.getElementById("hardModeButton");
const resetButton = document.getElementById("resetButton");
const generateButton = document.getElementById("generateButton")
const successButton = document.getElementById("successButton");
const failButton = document.getElementById("failButton");
const skipButton = document.getElementById("skipButton")

let completed, failed, skips;
let currentChallenge = -1, currentActivity = -1;
let skipsMax = 999; //default value to be changed
let hardmode;

readFromFile();

console.log(currentChallenge);

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function resetSaveInfo() {
    const data = {
        completed: 0,
        failed: 0,
        skips: 0,
        currentChallenge: -1,
        currentActivity: -1,
        hardmode: false
    };

    localStorage.setItem("challengeData", JSON.stringify(data));
}

function saveInfo() {
    if (skips === undefined || skips === null) {
        skips = 0;
    }
    const data = {
        completed: completed,
        failed: failed,
        skips: skips,
        currentChallenge: currentChallenge,
        currentActivity: currentActivity,
        hardmode: hardmode
    };

    localStorage.setItem("challengeData", JSON.stringify(data));
}

function readFromFile() {
    let data;
    try {
        data = localStorage.getItem("challengeData");
    } catch (error) {
        data = false;
        console.error("No data found in localStorage:", error);
    }

    if (data) {
        console.log("not first time");
        const parsed = JSON.parse(data);

        completed = parsed.completed || 0;
        failed = parsed.failed || 0;
        skips = parsed.skips;
        if (skips === undefined || skips === null) {
            skips = 5;
        }
        currentChallenge = parsed.currentChallenge || -1;
        currentActivity = parsed.currentActivity || -1;
        hardmode = parsed.hardmode || false;
        updateDisplay(0);

    } else {
        console.log("first time");
        completed = 0;
        failed = 0;
        skips = 5;
        currentChallenge = -1;
        currentActivity = -1;
        hardmode = false;
        updateDisplay(1);
    }

    completedCountEl.textContent = completed;
    failedCountEl.textContent = failed;
    skipsCountEl.textContent = skips;
    reselectCurrentActivity();
    reselectCurrentChallenge();
}

function updateDisplay(firstTime = false) {
    if (firstTime) {
        generateButton.style.display = "block";
        hardModeButton.style.display = "none";
        hardModeTitle.style.display = "none";
        successButton.style.display = "none";
        resetButton.style.display = "none";
        failButton.style.display = "none";
        skipButton.style.display = "none";
        counterElement.style.display = "none";
    } else {
        generateButton.style.display = "none";
        hardModeButton.style.display = "inline-flex";
        hardModeTitle.style.display = "block";
        resetButton.style.display = "inline-flex";
        counterElement.style.display = "inline-flex";
        successButton.style.display = "block";
        failButton.style.display = "block";
        skipButton.style.display = "block";
    }
}

function incrementSkippsCounter() {
    if (hardmode) {
        if (skips <= skipsMax) {
            skips++;
            skipsCountEl.textContent = skips;
        }
    }
}

function changeLanguage(){
    reselectCurrentActivity();
    reselectCurrentChallenge();
    changeHardModeButtonText();
    switch(selectedLanguage){
        case languages.ENGLISH:
            hardModeTitle.innerText = "Hard mode";
            ChallengeGeneratorTitle.innerHTML = "Challenge Generator";
            completedCountText.firstChild.textContent = "✅ Completed ";
            failedCountText.firstChild.textContent = "❌ Failed ";
            skipCountText.firstChild.textContent = "⏭️ Skips ";
            resetButton.innerHTML = "Reset";
            failButton.innerHTML = "❌ Failed"
            skipButton.innerHTML = "⏭️ Skip";
            successButton.innerHTML = "✅ Completed";
            generateButton.innerHTML = "Generate a challenge"
            break;
        case languages.FRENCH:
        default:
           hardModeTitle.innerText  =  "Mode difficile";
            ChallengeGeneratorTitle.innerHTML = "Génerateur de défi";
            completedCountText.firstChild.textContent = "✅ Réussi ";
            failedCountText.firstChild.textContent = "❌ Échoué ";
            skipCountText.firstChild.textContent = "⏭️ Sauts ";
            resetButton.innerHTML = "Réinitialisé";
            failButton.innerHTML = "❌ Échoué";
            skipButton.innerHTML = "⏭️ Sauter";
            successButton.innerHTML = "✅ Réussi";
            generateButton.innerHTML = "Générer un défi"
            break;
        };
}

function changeHardModeButtonText(){
    switch(selectedLanguage){
        case languages.ENGLISH:
            if(hardmode){
                hardModeButton.textContent = "ON";
            }else{
                hardModeButton.textContent = "OFF";
            }
            break;
        case languages.FRENCH:
        default:
            if(hardmode){
                hardModeButton.textContent = "ACTIVÉ";
            }else{
                hardModeButton.textContent = "DÉSACTIVÉ";
            }
            break;
    }
}

function reselectCurrentActivity(){
    if(currentActivity == -1){
        switch(selectedLanguage){
        case languages.ENGLISH:
            activity.textContent =  "Press to generate challenge";
            break;
        case languages.FRENCH:
            activity.textContent =  "Appuyer pour générée un défi";
            break;
        default:
            activity.textContent =  "";
            break;
        };
    }else{
        switch(selectedLanguage){
            case languages.ENGLISH:
                activity.textContent =  activities_en.at(currentActivity);
                break;
            case languages.FRENCH:
                activity.textContent =  activities_fr.at(currentActivity);
                break;
            default:
                activity.textContent =  "";
                break;
        };
    }
}

function generateActivity() {
    currentActivity = getRandomInt(0,NUMBER_OF_ACTIVITIES-1);
    reselectCurrentActivity();
    currentChallenge = -1;
    generateChallenge()
    console.log("generated");
}

function reselectCurrentChallenge(){
     if (currentChallenge != -1 && hardmode) {
        switch(selectedLanguage){
        case languages.ENGLISH:
            challenge.textContent  =  challenges_en.at(currentChallenge);
            break;
        case languages.FRENCH:
            challenge.textContent  =  challenges_fr.at(currentChallenge);
            break;
        default:
            challenge.textContent  =  "";
            break;
        };
    } else {
        challenge.textContent = "";
    }
}

function generateChallenge() {
    if (hardmode) {
        if (currentChallenge == -1) {
            currentChallenge = getRandomInt(0,NUMBER_OF_CHALLENGES-1);
        };
    }
    reselectCurrentChallenge();
}

function resetData() {
    localStorage.removeItem("challengeData");
}

englishButton.addEventListener("click", () => {
    console.log("swithced language to english");
    selectedLanguage = languages.ENGLISH;
    changeLanguage();
});


frenchButton.addEventListener("click", () => {
    console.log("swithced language to french");
    selectedLanguage = languages.FRENCH;
    changeLanguage();
});

hardModeButton.addEventListener("click", () => {
    console.log("added changed");
    hardmode = !hardmode;
    changeHardModeButtonText();
    if (hardmode) {
        challenge.style.display = "block";
        if (challenge.textContent == "") {
            generateChallenge();
        }
    } else {
        challenge.style.display = "none";
        challenge.textContent = "";

    }
});

resetButton.addEventListener("click", () => {
    resetData();
    readFromFile();
    updateDisplay(1);
});

generateButton.addEventListener("click", () => {
    updateDisplay(0);
    generateActivity();
    saveInfo();
});

successButton.addEventListener("click", () => {
    completed++;
    completedCountEl.textContent = completed;
    generateActivity();
    incrementSkippsCounter();
    saveInfo();
});

failButton.addEventListener("click", () => {
    failed++;
    failedCountEl.textContent = failed;
    generateActivity();
    saveInfo();
});

skipButton.addEventListener("click", () => {
    if (skips > 0) {
        skips--;
        skipsCountEl.textContent = skips;
        generateActivity();
        saveInfo();
    }
});
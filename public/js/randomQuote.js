const randomQuote = document.querySelector(".randomQuote");
const author = document.querySelector(".randomQuoteAuthor");
const apiUrl = "https://api.quotable.io/random";

let lastUpdated = sessionStorage.getItem("lastUpdated");

if (!lastUpdated || new Date() - new Date(lastUpdated) > 86400000) {
  getQuote();
} else {
randomQuote.innerText = sessionStorage.getItem("lastQuote");
  author.innerText = sessionStorage.getItem("lastAuthor");
}

function getQuote() {
  fetch(apiUrl)
    .then((data) => data.json())
    .then((item) => {
      randomQuote.innerText = item.content;
      author.innerText = item.author;
      sessionStorage.setItem("lastUpdated", new Date().toString());
      sessionStorage.setItem("lastQuote", item.content);
      sessionStorage.setItem("lastAuthor", item.author);
    })
    .catch((error) => console.error(error));
}

setInterval(getQuote, 86400000);

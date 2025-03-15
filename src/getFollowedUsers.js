
function script() {
  const userCardsContainer = document.querySelector("div[data-testid='grid-container']");
  if (userCardsContainer == null) {
    console.error(`Something went wrong! Couldn't find the 'userCardsContainer'. There should be a 'div' element with an attribute data-testid='grid-container'. Try reloading the page and run the script again. If the problem persists, maybe this attribute was renamed or something else was changed - or the problem is in you end. Anyway: contact me so I can try to solve the issue!`);
    return;
  }
  const anchorsNodeList = userCardsContainer.querySelectorAll('a');

  const anchorsArray = Array.from(anchorsNodeList);

  const regex = new RegExp('spotify.com/user/');

  const userUrls = anchorsArray.filter((a) => regex.test(a.href)).map((url) => url.href);

  return userUrls;
}

script(); 
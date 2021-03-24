var msgs = ["It’s donezo",
  "Congrats! You have successfully broke the site",
  "Welcome to nowhere!?",
  "NANI!? WHERE U at!?",
  "Welcome to your mind, it\'s empty!",
  "too lazy to find the page...",
  "Senpai are you lost?",
  "I wish I wasn\'t found :(",
  "4.0able course not found",
  "B-b-b-bbbbaka?",
  "NANI?! What how’d you get here oni-Chan",
  "Page is too busy playing League",
  "This page fell off a bridge like I should have",
  "This page is broken, like me when Karen left me and took the kids",
  "Page has not reached the legal age to show up",
  "Probably for the best that this page doesn't show up",
  "I think this page had too many drinks....",
  "Always blame Javascript....no seriously",
  "This page was created by a computer science student...meaning they prob f- up the code",
  "F for respects. Page not found.",
  "Ohhh HTML5, I thought we were running HTML2",
  "We are using Angular 1 and not the latest Angular...prob why we can't find the page",
  "It\'s all imaginary... *cue spongebob rainbow meme",
  "It\’s ok though, the page is usually late",
  "This page has took an L",
  "&#128016; WWWWWWHHHHHHHHHAAAAAAAAAAA",
  "Something went wrong....",
  "Oh great...You broke the internet just like how Facebook broke Instagram ",
  "Did you ever hear the Tragedy of Darth Plagueis the wise?",
  "This page is not found just like my friends :'(",
  "They can\'t all be winners",
  "The requested URL /your-PAGE-is-scheibe was not found on our server",
  "Thanks Mario! But the page is in another castle",
  "Page not found...just like my social life when creating this website",
  "Sleep not found..."
];

function setmsg() {
  var msg = msgs[Math.floor(Math.random() * msgs.length)];
  document.getElementById('errormsg').innerHTML = msg;
}
setmsg();
/* ==========================================================================
   PROGRAMMER QUOTES & WISDOM DATA (200 Funny & Motivational Quotes)
   ========================================================================== */

const PROGRAMMER_QUOTES = [
  "“It works on my machine” is my love language.",
  "Code never lies, but comments sometimes hallucinate.",
  "Debugging: Being the detective in a crime movie where you are also the murderer.",
  "First, solve the problem. Then, write code. Then, fix what you broke.",
  "Programmer: Turning caffeine into software since forever.",
  "There’s no place like 127.0.0.1.",
  "I don’t always test my code, but when I do, I do it in production.",
  "Keep calm and clear the cache.",
  "Programming is 10% writing code and 90% wondering why it doesn’t work.",
  "If at first you don’t succeed, call it version 1.0.",
  "Coding is like humor—if you have to explain it, it’s bad.",
  "A bug is just an undocumented feature.",
  "Real programmers count from 0.",
  "Eat. Sleep. Code. Repeat.",
  "Semicolons are tiny but powerful. Respect them.",
  "My code doesn’t have bugs; it develops random features.",
  "Life is short. Use Python.",
  "When in doubt, reboot.",
  "Git happens.",
  "The best error message is the one that never shows up.",
  "Stay positive, test negative.",
  "You had me at “Hello World.”",
  "Ctrl + S is my cardio.",
  "Good code is its own best documentation.",
  "Coffee before code. Always.",
  "I speak fluent sarcasm and JavaScript.",
  "There’s no cloud. It’s just someone else’s computer.",
  "Make it work. Make it right. Make it fast.",
  "If debugging is removing bugs, programming must be putting them in.",
  "One does not simply deploy on Friday.",
  "Code hard or go home.",
  "99 little bugs in the code, take one down, patch it around… 117 bugs in the code.",
  "Trust the process… and the stack overflow answer.",
  "Developers do it with class.",
  "I turn coffee into commits.",
  "Think twice, code once.",
  "Keep coding and nobody explodes.",
  "The quieter you become, the more you can hear the compiler scream.",
  "Stay curious. Stay coding.",
  "It compiled. Ship it.",
  "In code we trust.",
  "A day without coding is like… just kidding, I have no idea.",
  "Refactor today for a better tomorrow.",
  "Less talk, more code.",
  "Keyboard > Pen.",
  "Programming: Where yesterday’s fix is today’s bug.",
  "Code like nobody’s watching.",
  "Happiness is a successful build.",
  "Keep your friends close and your functions closer.",
  "Save early, save often.",
  "If it’s stupid but it works, it’s not stupid.",
  "Debug like a ninja.",
  "Code smarter, not harder.",
  "I don’t age; I just level up.",
  "When nothing works, read the docs.",
  "Make bugs fear you.",
  "Hack the planet (ethically).",
  "Dream in code.",
  "Stay hydrated and validate.",
  "Commit messages matter.",
  "Write code like the next developer is a psychopath who knows where you live.",
  "Keep pushing to main… carefully.",
  "Less bugs, more hugs.",
  "Console.log is my therapist.",
  "Be the exception, not the error.",
  "Failure is just another test case.",
  "Code today, conquer tomorrow.",
  "Don’t panic, it’s just a 500 error.",
  "Refuse to be undefined.",
  "Think different. Code differently.",
  "There is no “nearly working.”",
  "May the source be with you.",
  "Clean code, clear mind.",
  "If it compiles, it’s a miracle.",
  "Fear the merge conflict.",
  "The code must flow.",
  "Stack overflow is my co-pilot.",
  "Eat bugs for breakfast.",
  "Automate all the things.",
  "Hello bug, my old friend.",
  "Keep your loops tight.",
  "Write once, debug everywhere.",
  "A programmer’s best friend is version control.",
  "Stay sharp, indent properly.",
  "Be bold, refactor old.",
  "Code is poetry… sometimes abstract.",
  "Fix the cause, not the symptom.",
  "Programmers never die; they just go offline.",
  "Always bet on binary.",
  "Less drama, more data.",
  "I see deadlocks.",
  "Stay logical.",
  "One bug closer to success.",
  "Think in algorithms.",
  "Code like a boss.",
  "Panic is not a strategy.",
  "Break things. Learn things.",
  "Write tests. Thank yourself later.",
  "Ship early. Patch often.",
  "Optimize later.",
  "No guts, no Git.",
  "Respect the semicolon.",
  "Make it simple, but significant.",
  "Bugs build character.",
  "Code is cheaper than therapy.",
  "I brake for breakpoints.",
  "Keep calm and git pull.",
  "Your vibe attracts your tribe—and your bugs.",
  "Every great app started with a single line.",
  "Don’t comment bad code—rewrite it.",
  "Keyboard warriors unite.",
  "Debugging is brain exercise.",
  "Save the trees, write code.",
  "Code with confidence.",
  "If it’s not tested, it’s broken.",
  "Build. Break. Repeat.",
  "Today’s error is tomorrow’s lesson.",
  "Code never sleeps.",
  "Your future is open source.",
  "Stay classy, write classes.",
  "Byte by byte.",
  "Fix it in the next sprint.",
  "Think before you sync.",
  "Keep your APIs clean.",
  "Coding is cheaper than hardware.",
  "Don’t feed the bugs.",
  "Think big. Code small.",
  "Write code that matters.",
  "Hack responsibly.",
  "Learn. Code. Share.",
  "Keep functions pure and coffee strong.",
  "Code your dreams.",
  "Stay DRY.",
  "Avoid spaghetti—unless it’s lunch.",
  "One commit at a time.",
  "Code is my superpower.",
  "Think like a user. Code like a pro.",
  "Make errors your teachers.",
  "Stay focused and refactor.",
  "Never trust user input.",
  "Practice makes permanent.",
  "Better code, better world.",
  "Logic over panic.",
  "Code with heart.",
  "Debug the impossible.",
  "Stay binary.",
  "Coffee is my framework.",
  "Write code. Leave legacy.",
  "Keep learning loops.",
  "Create. Compile. Celebrate.",
  "Code is art with semicolons.",
  "You are one bug fix away from genius.",
  "Stay humble, push often.",
  "Don’t fear the stack trace.",
  "Learn from 404s.",
  "The best code is no code.",
  "Stay sharp, stay syntax.",
  "Solve problems, not just errors.",
  "Commit to greatness.",
  "Push your limits, not broken code.",
  "Logic is power.",
  "Code like it’s open book exam.",
  "Embrace the refactor.",
  "Be the dev you needed yesterday.",
  "Let the code speak.",
  "Think in functions.",
  "Every bug has a backstory.",
  "Code beyond limits.",
  "Keep shipping.",
  "Fail fast, fix faster.",
  "Test early, test often.",
  "No bug left behind.",
  "Code clean, dream big.",
  "Keep it modular.",
  "Progress, not perfection.",
  "Fix the root.",
  "Be syntax-savvy.",
  "Upgrade yourself daily.",
  "Code fearlessly.",
  "Stay committed.",
  "Less excuses, more execution.",
  "Master the basics.",
  "Learn something new every commit.",
  "Write code you’re proud of.",
  "Small steps, big systems.",
  "Refactor like a hero.",
  "Break limits, not builds.",
  "Keep it scalable.",
  "Code with purpose.",
  "You’ve got the power(shell).",
  "Innovate, iterate, inspire.",
  "Stay ahead of the curve bracket.",
  "Keep coding, keep growing.",
  "Success is just a deployed feature away.",
  "Build the future, line by line.",
  "Confidence compiles.",
  "Code like tomorrow depends on it.",
  "Make every byte count.",
  "Keep pushing pixels and limits.",
  "The best programmers never stop learning."
];

let autoQuoteInterval = null;
let currentQuoteIdx = 0;

function getRandomQuoteIndex() {
  return Math.floor(Math.random() * PROGRAMMER_QUOTES.length);
}

function displayRandomQuote(animate = true) {
  const quoteTextEl = document.getElementById('programmer-quote-text');
  const quoteBadgeEl = document.getElementById('programmer-quote-number');
  if (!quoteTextEl) return;

  const nextIdx = getRandomQuoteIndex();
  currentQuoteIdx = nextIdx;
  const quote = PROGRAMMER_QUOTES[nextIdx];

  if (animate) {
    quoteTextEl.style.opacity = '0';
    quoteTextEl.style.transform = 'translateY(10px)';
    setTimeout(() => {
      quoteTextEl.textContent = quote;
      if (quoteBadgeEl) {
        quoteBadgeEl.textContent = `Quote #${nextIdx + 1} of ${PROGRAMMER_QUOTES.length}`;
      }
      quoteTextEl.style.opacity = '1';
      quoteTextEl.style.transform = 'translateY(0)';
    }, 200);
  } else {
    quoteTextEl.textContent = quote;
    if (quoteBadgeEl) {
      quoteBadgeEl.textContent = `Quote #${nextIdx + 1} of ${PROGRAMMER_QUOTES.length}`;
    }
  }
}

function copyCurrentQuote() {
  const quoteTextEl = document.getElementById('programmer-quote-text');
  if (!quoteTextEl) return;
  const text = quoteTextEl.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    const copyBtn = document.getElementById('quote-copy-btn');
    if (copyBtn) {
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
      copyBtn.style.background = 'rgba(52, 211, 153, 0.3)';
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.background = '';
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy quote: ', err);
  });
}

function initQuotesWidget() {
  displayRandomQuote(false);

  const shuffleBtn = document.getElementById('quote-shuffle-btn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      const icon = shuffleBtn.querySelector('i');
      if (icon) icon.style.transform = 'rotate(180deg)';
      displayRandomQuote(true);
      setTimeout(() => { if (icon) icon.style.transform = 'rotate(0deg)'; }, 300);
    });
  }

  const copyBtn = document.getElementById('quote-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyCurrentQuote);
  }

  const autoToggle = document.getElementById('quote-auto-toggle');
  if (autoToggle) {
    autoToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!autoQuoteInterval) {
          autoQuoteInterval = setInterval(() => {
            displayRandomQuote(true);
          }, 6000);
        }
      } else {
        if (autoQuoteInterval) {
          clearInterval(autoQuoteInterval);
          autoQuoteInterval = null;
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initQuotesWidget();
});

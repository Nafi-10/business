/* Typed.js Configuration for MD Kazi Jawadul Islam Portfolio */
let typedInstance = null;

function initTyped(stringsArray) {
  const targetElement = document.getElementById('typed');
  if (!targetElement || typeof Typed === 'undefined') return;

  const stringsToUse = (stringsArray && stringsArray.length > 0) ? stringsArray : [
    "B.Sc Student in Computing & Information System",
    "AI Enthusiast",
    "Cyber Security Interested",
    "IoT Explorer",
    "Business Analyst at Akand Engineering",
    "Graphics Designer",
    "Campus Ambassador"
  ];

  if (typedInstance) {
    typedInstance.destroy();
  }

  typedInstance = new Typed('#typed', {
    strings: stringsToUse,
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 2000,
    startDelay: 500,
    loop: true,
    showCursor: true,
    cursorChar: '|'
  });
}

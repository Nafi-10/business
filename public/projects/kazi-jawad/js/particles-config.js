/* Particles.js Configuration for MD Kazi Jawadul Islam Portfolio */
function initParticles({ elementId = 'particles-js', interactive = true, reducedMotion = false } = {}) {
  if (typeof particlesJS !== 'undefined' && document.getElementById(elementId)) {
    particlesJS(elementId, {
      "particles": {
        "number": {
          "value": 80,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#00d4ff"
        },
        "shape": {
          "type": "circle"
        },
        "opacity": {
          "value": 0.5,
          "random": false
        },
        "size": {
          "value": 3,
          "random": true
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#00d4ff",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": !reducedMotion,
          "speed": 3,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false
        }
      },
      "interactivity": {
        "detect_on": "window",
        "events": {
          "onhover": {
            "enable": interactive && !reducedMotion,
            "mode": "grab"
          },
          "onclick": {
            "enable": interactive && !reducedMotion,
            "mode": "push"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 200,
            "line_linked": {
              "opacity": 0.85
            }
          },
          "push": {
            "particles_nb": 4
          }
        }
      },
      "retina_detect": true
    });
  }
}

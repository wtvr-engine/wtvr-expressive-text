import WTVRElement from "./node_modules/wtvr-element/wtvr-element.js";
let html = WTVRElement.createTemplate;

let elementStyle = html`
<style>
.invisible {
    color : rgba(0,0,0,0)
}
.inline-block {
  display: inline-block;
}
@keyframes wavy {
    from {transform: translateY(-0.1em);}
    to {transform: translateY(0.1em);}
}
@keyframes spooky {
    from {transform: translateY(-0.04em);}
    to {transform: translateY(0.04em);}
}
@keyframes spooky-horizontal {
    from {transform: translateX(-0.04em);}
    to {transform: translateX(0.04em);}
}
@keyframes rainbow {
    from {
        color: #e50000;
    }
    16.6% {
        color: #ff8d00;
    }
    33.3% {
        color: #f7d21b;
    }
    50% {
        color: #008121;
    }
    66.6% {
        color: #004cff
    }
    83.3% {
        color: #760188;
    }
    to {
        color: #e50000;
    }
}

.wavy {
  display: inline-block;
  animation-name : wavy;
  animation-iteration-count: infinite;
  animation-direction : alternate;
  animation-duration: 0.25s;
  animation-timing-function: ease-in-out;
  white-space: pre-wrap;
}

.wavy-rainbow {
  display: inline-block;
  white-space: pre-wrap;
  animation : wavy 0.25s ease-in-out 0s infinite alternate, rainbow 1.5s linear 0s infinite;
}

.spooky {
  display: inline-block;
  white-space: pre-wrap;
  animation : spooky 0.17s steps(2,end) 0s infinite alternate;
}

.spooky-horizontal {
  display: inline-block;
  white-space: pre-wrap;
  animation : spooky-horizontal 0.12s steps(2,end) 0s infinite alternate;
}
.yelling {
  text-transform: uppercase;
}
</style>`;

let coreTemplate = html`<span class="visible"></span><span class="invisible"></span>`
console.log(coreTemplate);

export default class WTVRExpressiveText extends WTVRElement {
    constructor(){
        super();
        this.parsingIndex = 0;
        this.totalTime = 0;
        this.currentIndex = 0;
        this.timeSinceLastLetter = 0;
        this.sections = [];
        this.nextInterval = 1;
        this.getNumberAttribute("interval",18);
        this.getNumberAttribute("delay",0);
        let originalNode = WTVRElement.createElement(elementStyle);
        let children = document.createDocumentFragment();
        while(this.children.length > 0){
          children.appendChild(this.children[0]);
        }
        originalNode.appendChild(children);
        this.attachShadow({mode : "open"}).appendChild(originalNode);

    }
    connectedCallback(){
      let children = Array.from(this.shadowRoot.childNodes);
      for(let i = 0; i < children.length; i++){
        this.indexText(children[i]);
      }
      super.connectedCallback();
    }
    start(){
        super.start();
    }

    update(deltaTime){
        super.update();
        if(this.totalTime < this.delay || this.currentIndex >= this.parsingIndex){
          this.totalTime += deltaTime;
          return;
        }
        this.timeSinceLastLetter += deltaTime;
        this.sections.forEach((section) => {
          if(this.currentIndex >= section.start && this.currentIndex < section.end){
            let letter = section.invisible.textContent[0];
            if(this.timeSinceLastLetter > this.nextInterval*this.interval){
              section.invisible.textContent = section.invisible.textContent.substring(1);

              if(section.letterEffect == ""){
                section.visible.textContent += letter;
              }
              else{
                section.visible.appendChild(this.handleLetterEffect(letter,section));
              }
              this.timeSinceLastLetter = 0;
              this.currentIndex ++;
              this.nextInterval = this.getLetterMultiplicator(letter)*18/this.interval;
            }

          }
        });
    }

    indexText(elem){
      if(elem.hasChildNodes() && elem.tagName && elem.tagName.toLowerCase() !== "style" && elem.tagName.toLowerCase() !== "script"){
        let children = Array.from(elem.childNodes);
        for(let i = 0; i < children.length; i++){
          this.indexText(children[i]);
        }
      }
      else if(elem.nodeType == Node.TEXT_NODE && elem.data.trim().length > 0){

        let letterEffect = "";
        if(elem.parentNode.hasAttribute("data-letter-effect")){
          letterEffect = elem.parentNode.getAttribute("data-letter-effect");

          // since letters are  in separate inline-block spans, need to emulate proper word wrapping
          let words = elem.textContent.split(" ");
          words.forEach((word,i) => {
            if(word.length == 0){
              return;
            }
            let section = this.getSectionFor(word + (i == words.length -1 ? "" : " "),letterEffect);
            let wordSpan = document.createElement('span');
            wordSpan.appendChild(section.newContent);
            elem.parentNode.insertBefore(wordSpan,elem);
            wordSpan.classList += " inline-block";
            this.sections.push(section);
          });
          elem.parentNode.removeChild(elem);
        }
        else{
          let section = this.getSectionFor(elem.textContent,letterEffect);
          elem.parentNode.insertBefore(section.newContent,elem);
          elem.parentNode.removeChild(elem);
          this.sections.push(section);
        }

      }
    }

    getSectionFor(content,letterEffect){
      let newContent = WTVRElement.createElement(coreTemplate);
      let length = content.length;
      let section = { start : this.parsingIndex, end : this.parsingIndex + length, newContent : newContent, visible : newContent.children[0], invisible: newContent.children[1], letterEffect : letterEffect};
      section.invisible.textContent = content;
      this.parsingIndex += length;

      return section;

    }

    getLetterMultiplicator(letter){
      switch(letter){
        case ' ':
        return 2;
        case ',':
        return 12;
        case '.':
        case '!':
        case '?':
        return 35;
        case ';':
        return 19;
        default:
        return 1;
      }
    }

    handleLetterEffect(letter,section){
      switch(section.letterEffect){
        case 'wavy':
        return this.wavyLetter(letter,section);
        case 'spooky':
        return this.spookyLetter(letter,section);
        case 'wavy-rainbow':
        return this.wavyRainbowLetter(letter,section);
        case 'yelling':
        return this.yellingLetter(letter,section);
        default:
        return WTVRElement.createElement(`<span class="${section.letterEffect}">${letter}</span>`);
      }
    }

    wavyLetter(letter,section){
      let localIndex = (this.currentIndex -section.start);
      let letterEffectDelay = localIndex*0.05 - localIndex*this.interval*0.001;
      return WTVRElement.createElement(`<span class="wavy" style="animation-delay : ${letterEffectDelay}s">${letter}</span>`);
    }
    wavyRainbowLetter(letter,section){
      let localIndex = (this.currentIndex -section.start);
      let letterEffectDelay = localIndex*0.05 - localIndex*this.interval*0.001;
      return WTVRElement.createElement(`<span class="wavy-rainbow" style="animation-delay : ${letterEffectDelay}s;">${letter}</span>`);
    }
    spookyLetter(letter,section){
      let randomDelay = -Math.random();
      return WTVRElement.createElement(`<span class="spooky-horizontal"><span class="spooky" style="animation-delay : ${randomDelay}s;">${letter}</span></span>`);
    }
    yellingLetter(letter,section){
      let randomDelay = -Math.random();
      return WTVRElement.createElement(`<span class="spooky-horizontal"><span class="spooky yelling" style="animation-delay : ${randomDelay}s;">${letter}</span></span>`);
    }
}

import WTVRElement from "./node_modules/wtvr-element/wtvr-element.js";
let html = WTVRElement.createTemplate;

let elementStyle = html`
<style>
.invisible {
    color : rgba(0,0,0,0)
}
@keyframes wavy {
    from {bottom: -0.1em;}
    to {bottom: 0.1em;}
}

.wavy {
  position: relative;
  animation-name : wavy;
  animation-iteration-count: infinite;
  animation-direction : alternate;
  animation-duration: 0.25s;
  animation-timing-function: ease-in-out;
}
</style>`;

let coreTemplate = html`<span class="visible"></span><span class="invisible"></span>`

export default class WTVRExpressiveText extends WTVRElement {
    constructor(){
        super();
        this.parsingIndex = 0;
        this.totalTime = 0;
        this.currentIndex = 0;
        this.timeSinceLastLetter = 0;
        this.sections = [];
        this.nextInterval = 1;
        this.getNumberAttribute("interval",30);
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
              section.invisible.innerHTML = section.invisible.innerHTML.substring(1);

              if(section.letterEffect == ""){
                section.visible.innerHTML += letter;
              }
              else{
                let localIndex = (this.currentIndex -section.start);
                let letterEffectDelay = localIndex*0.05 - localIndex*this.interval*0.001;
                section.visible.appendChild(WTVRElement.createElement(`<span class="${section.letterEffect}" style="animation-delay : ${letterEffectDelay}s">${letter}</span>`));
              }

              this.timeSinceLastLetter = 0;
              this.currentIndex ++;
              this.nextInterval = this.getLetterMultiplicator(letter);
            }

          }
        })
    }

    indexText(elem){
      if(elem.hasChildNodes() && elem.tagName && elem.tagName.toLowerCase() !== "style" && elem.tagName.toLowerCase() !== "script"){
        let children = Array.from(elem.childNodes);
        for(let i = 0; i < children.length; i++){
          this.indexText(children[i]);
        }
      }
      else if(elem.nodeType == Node.TEXT_NODE && elem.data.trim().length > 0){
        let newContent = WTVRElement.createElement(coreTemplate);
        let letterEffect = "";
        if(elem.parentNode.hasAttribute("data-letter-effect")){
          letterEffect = elem.parentNode.getAttribute("data-letter-effect");
        }
        let section = { start : this.parsingIndex, end : this.parsingIndex + elem.length, visible : newContent.children[0], invisible: newContent.children[1], letterEffect : letterEffect};
        section.invisible.innerHTML = elem.data;
        this.parsingIndex += elem.length;
        elem.parentNode.insertBefore(newContent,elem);
        elem.parentNode.removeChild(elem);
        this.sections.push(section);
      }
    }

    getLetterMultiplicator(letter){
      switch(letter){
        case ' ':
        return 1.5;
        case ',':
        return 5;
        case '.':
        case '!':
        case '?':
        return 10;
        case ';':
        return 15;
        default:
        return 1;
      }
    }
}

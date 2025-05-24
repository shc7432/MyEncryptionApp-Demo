import{c as d,d as h,a as p,I as m,b as w,P as b,e as u}from"./index-CWBzu1Im.js";class f extends HTMLElement{#o;#e;#t;#i;constructor(){super(),this.#o=this.attachShadow({mode:"open"}),this.#e=document.createElement("common-file-preview"),this.#o.appendChild(this.#e);const t=document.createElement("style");t.textContent=`
            :host {
                display: block;
                box-sizing: border-box;
                overflow: hidden;
            }
            common-file-preview, video {
                width: 100%;
                height: 100%;
            }
            common-file-preview {
                overflow: auto;
            }
            video {
                object-fit: contain;
                background-color: #000;
            }
        `,this.#o.appendChild(t)}connectedCallback(){}disconnectedCallback(){this.#t&&this.#t!==!0&&d(this.#t),this.#i&&this.#i()}async load(t,n,c,o,r){if(this.#t)throw new Error("already loaded");if(o!=="video"){const a=new Blob([await t(0,c)]),s=new Blob([await h(a,n)],{type:o}),i=URL.createObjectURL(s);this.#e.init(()=>i,o,r),this.#t=!0,this.#i=()=>{URL.revokeObjectURL(i)};return}const e=document.createElement("video");e.controls=!0,e.playsInline=!0,this.#e.replaceWith(e),this.#e=e,this.#t=await p();const l=new m(t,c);await w(this.#t,l,n),this.#i=await b(e,async(a,s,i)=>await u(this.#t,a,s,i))}}customElements.define("simple-data-crypto-file-preview",f);
//# sourceMappingURL=simple-data-crypto-file-preview-CXZOOa99.js.map

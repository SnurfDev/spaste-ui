import { describe, expect, it, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeArea from '@/components/CodeArea.vue'
import { config } from '@vue/test-utils'
import { populateGlobal } from 'vitest/environments'

describe("CodeArea",()=>{
  it("loads data correctly",async()=>{
    vi.stubGlobal("Prism",{
      languages: {},
      highlight:(text:string,_lang:null,ln:string)=>`<span id="${ln}">${text}</span>`
    })
    const wrapper = mount(CodeArea,{
      props: {
        value: "console.log('Hello World!')",
        language: "js",
        disabled: true
      },
    });
    expect(wrapper.find("textarea").element.value).toEqual("console.log('Hello World!')");
    expect(wrapper.find("pre").classes()).includes("language-js")
    expect(wrapper.find("code").element.innerHTML).toEqual(`<span id="js">console.log('Hello World!')</span>`)
    expect(wrapper.find("textarea").element.hasAttribute("disabled")).toBeTruthy()
  });

  it("can change the value dynamically",async()=>{
    vi.stubGlobal("Prism",{
      languages: {},
      highlight:(text:string,_lang:null,ln:string)=>`<span id="${ln}">${text}</span>`
    })
    const wrapper = mount(CodeArea,{});
    await new Promise(res=>setTimeout(res,100));
    await wrapper.setProps({
      value: "test value"
    });
    expect(wrapper.find("textarea").element.value).toEqual("test value")
  });

  it("handles input events correctly",async ()=>{
    vi.stubGlobal("Prism",{
      languages: {},
      highlight:(text:string,_lang:null,ln:string)=>`<span id="${ln}">${text}</span>`
    })
    const wrapper = mount(CodeArea,{
      props: {
        value: "hello worl",
        language: "plain"
      }
    });
    await wrapper.find("textarea").setValue("hello world")
    await wrapper.find("textarea").trigger("input")
    expect(wrapper.find("code").element.innerHTML).toEqual(`<span id="plain">hello world</span>`)
    expect(wrapper.emitted("code-input")).toBeTruthy();
    expect(wrapper.emitted()["code-input"][0]).toEqual(["hello world"]);
  })
})
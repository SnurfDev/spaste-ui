import { describe, expect, it, test } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonPopup from '@/components/ButtonPopup.vue'

describe("ButtonPopup",()=>{
  it("can open and close",async ()=>{
    const wrapper = mount(ButtonPopup,{
      slots: {
        default: ['<p>Input your name</p><input type="text" name="name"><input type="submit" value="">']
      },
      props: {
        open: false
      }
    })

    expect(wrapper.find("form").exists()).toBeFalsy();
    await wrapper.setProps({open: true})
    expect(wrapper.find("form").exists()).toBeTruthy();
    await wrapper.setProps({open: false})
    expect(wrapper.find("form").exists()).toBeFalsy();
  });

  it("can submit",async ()=>{
    const wrapper = mount(ButtonPopup,{
      slots: {
        default: ['<p>Input your name and age</p><input type="text" name="name"><input type="number" name="age"><input type="submit" value="">']
      },
      props: {
        open: true
      }
    });
    await wrapper.find<HTMLInputElement>("input[type='text']").setValue("Max Mustermann")
    await wrapper.find<HTMLInputElement>("input[type='number']").setValue(32)

    await wrapper.find<HTMLInputElement>("form").trigger("submit")
    expect(wrapper.emitted("submit")).toBeTruthy()

    expect(wrapper.emitted().submit[0]).toEqual([{
      name: "Max Mustermann",
      age: "32"
    }])
  })
})

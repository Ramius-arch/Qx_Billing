import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { expect, test } from 'vitest'

test('mount component', async () => {
  expect(App).toBeTruthy()

  const wrapper = mount(App, {
    global: {
      stubs: ['router-view', 'router-link']
    }
  })

  expect(wrapper.html()).toMatchSnapshot()
})

import { it, expect, vi } from 'vitest'
import {
  requestAnimationFrame,
  cancelAnimationFrame,
  raf,
  doubleRaf,
  getStyle,
  getRect,
  inViewport,
  getParentScroller,
  getAllParentScroller,
  preventDefault,
  getScrollTop,
  getScrollLeft,
  classes,
  createNamespaceFn,
} from '../src'
import { describe } from 'node:test'

it('requestAnimationFrame', () => {
  const fn = vi.fn()
  const originFn = globalThis.requestAnimationFrame
  globalThis.requestAnimationFrame = fn

  requestAnimationFrame(fn)
  expect(fn).toHaveBeenCalled()

  globalThis.requestAnimationFrame = originFn
})

it('cancelAnimationFrame', () => {
  const fn = vi.fn()
  const originFn = globalThis.cancelAnimationFrame
  globalThis.cancelAnimationFrame = fn

  cancelAnimationFrame(1)
  expect(fn).toHaveBeenCalledWith(1)

  globalThis.cancelAnimationFrame = originFn
})

it('raf & doubleRaf', async () => {
  const fn = vi.fn((resolve) => resolve())
  const originFn = globalThis.requestAnimationFrame
  globalThis.requestAnimationFrame = fn

  await raf()
  expect(fn).toHaveBeenCalled()

  await doubleRaf()
  expect(fn).toHaveBeenCalledTimes(3)

  globalThis.requestAnimationFrame = originFn
})

it('getStyle', () => {
  const element = document.createElement('div')
  document.body.appendChild(element)
  const style = getStyle(element)
  expect(style).toBeInstanceOf(CSSStyleDeclaration)
  document.body.removeChild(element)
})

it('getRect', () => {
  const element = document.createElement('div')
  document.body.appendChild(element)
  const rect = getRect(element)
  expect(rect).toHaveProperty('width')
  document.body.removeChild(element)

  const windowRect = getRect(window)
  expect(windowRect).toHaveProperty('width', window.innerWidth)
  expect(JSON.stringify(windowRect)).toBe(
    JSON.stringify({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    }),
  )
})

it('inViewport should return true if element is in viewport', () => {
  const element = document.createElement('div')
  document.body.appendChild(element)
  Object.assign(element.style, { position: 'fixed', top: '0', left: '0' })

  expect(inViewport(element)).toBe(true)
  document.body.removeChild(element)
})

describe('getParentScroller', () => {
  it('found', () => {
    const parent = document.createElement('div')
    parent.style.overflowY = 'scroll'
    document.body.appendChild(parent)

    const child = document.createElement('div')
    parent.appendChild(child)

    expect(getParentScroller(child)).toBe(parent)
    document.body.removeChild(parent)
  })

  it('not found', () => {
    const child = document.createElement('div')
    expect(getParentScroller(child)).toBe(window)
  })
})

it('getAllParentScroller', () => {
  const parent1 = document.createElement('div')
  parent1.style.overflowY = 'scroll'
  const parent2 = document.createElement('div')
  document.body.appendChild(parent1)
  parent1.appendChild(parent2)

  const child = document.createElement('div')
  parent2.appendChild(child)

  expect(getAllParentScroller(child)).toEqual([parent1, window])
  document.body.removeChild(parent1)
})

describe('preventDefault', () => {
  it('cancelable', () => {
    const event = { preventDefault: vi.fn(), cancelable: true } as unknown as Event
    preventDefault(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('not cancelable', () => {
    const event = { preventDefault: vi.fn(), cancelable: false } as unknown as Event
    preventDefault(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
  })
})

it('getScrollTop', () => {
  document.body.scrollTop = 100
  expect(getScrollTop(document.body)).toBe(100)
})

it('getScrollLeft', () => {
  document.body.scrollLeft = 50
  expect(getScrollLeft(document.body)).toBe(50)
})

it('classes should return an array of classes based on conditions', () => {
  expect(classes('class1', [true, 'class2'], [false, 'class3', 'class4'])).toEqual(['class1', 'class2', 'class4'])
})

it('createNamespaceFn should create a BEM namespace function', () => {
  const createNamespace = createNamespaceFn('var')
  const { n } = createNamespace('button')

  expect(n()).toBe('var-button')
  expect(n('element')).toBe('var-button__element')
  expect(n('--modifier')).toBe('var-button--modifier')
  expect(n('$-box')).toBe('var-box')
})

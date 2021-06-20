import { deepEqual, equal } from 'assert'
import dataPatch from '../lib/datapatch.js'

describe('dataPatch', function () {
  it('patches a simple object', function () {
    let data = { a: 1, b: 2 }
    dataPatch(data, { a: 3 })
    deepEqual({ a: 3, b: 2 }, data)
  })

  it('patches a nested object', function () {
    let data = { a: { b: 1, c: 2 } }
    dataPatch(data, { 'a.b': 3 })
    deepEqual({ a: { b: 3, c: 2 } }, data)
  })

  it('patches a nested object in an array', function () {
    let data = {
      a: {
        b: [{ c: 1 }, { d: 1 }],
      },
    }

    dataPatch(data, { 'a.b': [{ c: 3 }, { d: 3 }] })
    deepEqual({ a: { b: [{ c: 3 }, { d: 3 }] } }, data)
  })

  it('returns false if the patch traverses an undefined path in the data', function () {
    equal(dataPatch({ a: 1 }, { 'a.b': 1 }), false)
  })
})

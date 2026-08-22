import { describe, expect, it } from 'vitest'
import { analyze, calculateChart, fixtures } from './engine'

describe('fixtures de regresión',()=>{
  it('Eber conserva los cuatro pilares de referencia',()=>{
    const c=calculateChart(fixtures.eber)
    expect([c.pillars.year.stem,c.pillars.year.branch]).toEqual(['bing','rat'])
    expect([c.pillars.month.stem,c.pillars.month.branch]).toEqual(['yi','goat'])
    expect([c.pillars.day.stem,c.pillars.day.branch]).toEqual(['wu','horse'])
    expect([c.pillars.hour.stem,c.pillars.hour.branch]).toEqual(['ding','snake'])
  })
  it('Anju conserva los cuatro pilares de referencia',()=>{
    const c=calculateChart(fixtures.anju)
    expect([c.pillars.year.stem,c.pillars.year.branch]).toEqual(['geng','dragon'])
    expect([c.pillars.month.stem,c.pillars.month.branch]).toEqual(['geng','dragon'])
    expect([c.pillars.day.stem,c.pillars.day.branch]).toEqual(['yi','rabbit'])
    expect([c.pillars.hour.stem,c.pillars.hour.branch]).toEqual(['ding','ox'])
  })
  it('Dragón–Dragón adyacente genera la observación específica',()=>{
    const r=analyze(fixtures.anju)
    expect(r.insights.some(x=>x.id==='dragon-dragon-belongings')).toBe(true)
  })
  it('Rabbit–Dragon queda fuera del resumen principal',()=>{
    const r=analyze(fixtures.anju)
    expect(r.insights.some(x=>x.id==='rabbit-dragon-partial')).toBe(false)
  })
  it('el selector nunca rellena con más de seis frases',()=>{
    expect(analyze(fixtures.eber).insights.length).toBeLessThanOrEqual(6)
  })
})

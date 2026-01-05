import React from 'react'

export default function Slider({value=50,onChange}:{value?:number,onChange?:(v:number)=>void}){
  return (
    <input type="range" min={0} max={100} value={value} onChange={e=>onChange?.(Number(e.target.value))} />
  )
}

import React from 'react'
import Slider from '../UI/Slider'

export default function RightPanel(){
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{fontWeight:600}}>Adjustments</div>
      <div>
        <div style={{fontSize:12,color:'#9aa6b2'}}>Brightness</div>
        <Slider />
      </div>
      <div>
        <div style={{fontSize:12,color:'#9aa6b2'}}>Contrast</div>
        <Slider />
      </div>
    </div>
  )
}

import React from 'react'

export default function LeftSidebar(){
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:12,gap:8}}>
      <button style={{width:40,height:40,borderRadius:8,background:'#0b2130',color:'#9fc7d2',border:0}}>📁</button>
      <button style={{width:40,height:40,borderRadius:8,background:'#0b2130',color:'#9fc7d2',border:0}}>✂️</button>
      <button style={{width:40,height:40,borderRadius:8,background:'#0b2130',color:'#9fc7d2',border:0}}>🎨</button>
    </div>
  )
}

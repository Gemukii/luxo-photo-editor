import React from 'react'

export default function Badge({children}:{children:React.ReactNode}){
  return (
    <span style={{background:'#083240',padding:'4px 8px',borderRadius:999,fontSize:12}}>{children}</span>
  )
}

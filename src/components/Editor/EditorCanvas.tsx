import React from 'react'
import { useEditorStore } from '../../store/editorStore'

export default function EditorCanvas(){
  const image = useEditorStore(state=>state.image)

  return (
    <div style={{width:'100%',height:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="Loaded" style={{maxWidth:'90%',maxHeight:'90%',borderRadius:6,boxShadow:'0 6px 22px rgba(0,0,0,0.6)'}} />
      ) : (
        <div style={{color:'#9aa6b2'}}>No image loaded — use the upload control.</div>
      )}
    </div>
  )
}

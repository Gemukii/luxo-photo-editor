import React from 'react'
import { useEditorStore } from '../../store/editorStore'

export default function TopToolbar(){
  const reset = useEditorStore(s=>s.reset)
  const undo = useEditorStore(s=>s.undo)
  const redo = useEditorStore(s=>s.redo)

  return (
    <div style={{display:'flex',alignItems:'center',height:'100%',gap:8,padding:'8px 12px'}}>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}

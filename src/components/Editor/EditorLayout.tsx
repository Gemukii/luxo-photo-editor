import React from 'react'
import LeftSidebar from './LeftSidebar'
import TopToolbar from './TopToolbar'
import EditorCanvas from './EditorCanvas'
import RightPanel from './RightPanel'

export default function EditorLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{display:'flex',height:'100vh',gap:0}}>
      <aside style={{width:64,background:'#071028'}}>
        <LeftSidebar />
      </aside>
      <main style={{flex:1,display:'flex',flexDirection:'column'}}>
        <header style={{height:56}}>
          <TopToolbar />
        </header>
        <section style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',background:'#081221'}}>
          <EditorCanvas />
        </section>
      </main>
      <aside style={{width:320,background:'#05121a',padding:12}}>
        <RightPanel />
      </aside>
    </div>
  )
}

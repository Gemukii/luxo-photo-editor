import create from 'zustand'
import { EditorState } from '../types/editor.types'

type EditorActions = {
  setImage: (dataUrl: string)=>void
  undo: ()=>void
  redo: ()=>void
  reset: ()=>void
}

export const useEditorStore = create<EditorState & EditorActions>((set,get)=>({
  image: null,
  history: [],
  future: [],
  setImage: (dataUrl)=> set(state=>({
    image: dataUrl,
    history: state.image ? [...state.history, state.image] : state.history,
    future: []
  })),
  undo: ()=> set(state=>{
    const last = state.history[state.history.length-1] ?? null
    if(!last) return state
    const newHistory = state.history.slice(0,-1)
    const cur = state.image
    return { image: last, history: newHistory, future: cur ? [cur,...state.future] : state.future }
  }),
  redo: ()=> set(state=>{
    const next = state.future[0]
    if(!next) return state
    const newFuture = state.future.slice(1)
    const cur = state.image
    return { image: next, history: cur ? [...state.history, cur] : state.history, future: newFuture }
  }),
  reset: ()=> ({ image: null, history: [], future: [] })
}))

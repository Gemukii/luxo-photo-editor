export function loadImageFile(file: File): Promise<string> {
  return new Promise((res, rej)=>{
    const reader = new FileReader()
    reader.onload = ()=>{
      if(typeof reader.result === 'string') res(reader.result)
      else rej(new Error('Failed to read file'))
    }
    reader.onerror = ()=> rej(reader.error)
    reader.readAsDataURL(file)
  })
}

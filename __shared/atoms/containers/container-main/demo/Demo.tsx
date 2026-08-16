import '../container-main.css'

export const Demo = () => {

  return (
    <div>
    <div className="grid with-header">
       <div className='pad-sm'>container-atom</div>
       <div className='grid'>
        <div className='container-main'>container-main</div>
        <div className='container-main' data-style='inset'>inset</div>
        <div className='container-main' data-style='lifted'>lifted</div>

       </div>
    </div>
    <div className="grid with-header">
       <div className='pad-sm'>container-atom--alt</div>
       <div className='grid'>
        <div className='container-main--alt'>container-main</div>
        <div className='container-main--alt' data-style='inset'>inset</div>
        <div className='container-main--alt' data-style='lifted'>lifted</div>

       </div>
    </div>
    </div>
  )
}

 
export default Demo

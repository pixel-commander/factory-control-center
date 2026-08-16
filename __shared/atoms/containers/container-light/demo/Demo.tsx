import '../container-light.css'

export const Demo = () => {

  return (
    <div>
    <div className="grid with-header">
       <div className='pad-sm'>container-atom</div>
       <div className='grid'>
        <div className='container-light'>container-light</div>
        <div className='container-light' data-style='inset'>inset</div>
        <div className='container-light' data-style='lifted'>lifted</div>

       </div>
    </div>
    <div className="grid with-header">
       <div className='pad-sm'>container-atom--alt</div>
       <div className='grid'>
        <div className='container-light--alt'>container-light</div>
        <div className='container-light--alt' data-style='inset'>inset</div>
        <div className='container-light--alt' data-style='lifted'>lifted</div>

       </div>
    </div>
    </div>
  )
}

 
export default Demo

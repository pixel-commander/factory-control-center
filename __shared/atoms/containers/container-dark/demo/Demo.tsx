import '../container-dark.css'

export const Demo = () => {

  return (
    <div>
    <div className="grid with-header">
       <div className='pad-sm'>container-atom</div>
       <div className='grid'>
        <div className='container-dark'>container-dark</div>
        <div className='container-dark' data-style='inset'>inset</div>
        <div className='container-dark' data-style='lifted'>lifted</div>

       </div>
    </div>
    <div className="grid with-header">
       <div className='pad-sm'>container-atom--alt</div>
       <div className='grid'>
        <div className='container-dark--alt'>container-dark</div>
        <div className='container-dark--alt' data-style='inset'>inset</div>
        <div className='container-dark--alt' data-style='lifted'>lifted</div>

       </div>
    </div>
    </div>
  )
}

 
export default Demo

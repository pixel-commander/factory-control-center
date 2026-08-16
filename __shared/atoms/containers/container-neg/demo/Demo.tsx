import '../container-neg.css'

export const Demo = () => {

  return (
    <div>
    <div className="grid with-header">
       <div className='pad-sm'>container-atom</div>
       <div className='grid'>
        <div className='container-neg'>container-neg</div>
        <div className='container-neg' data-style='inset'>inset</div>
        <div className='container-neg' data-style='lifted'>lifted</div>

       </div>
    </div>
    <div className="grid with-header">
       <div className='pad-sm'>container-atom--alt</div>
       <div className='grid'>
        <div className='container-neg--alt'>container-neg</div>
        <div className='container-neg--alt' data-style='inset'>inset</div>
        <div className='container-neg--alt' data-style='lifted'>lifted</div>

       </div>
    </div>
    </div>
  )
}

 
export default Demo

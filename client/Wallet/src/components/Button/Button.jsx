const Button = ({
    label='',
    type='',
    classname='',
    disabled=false,
    cname='',
    onClick=()=>{},
}) => {
  return (
    <div className={cname}>
        <button type={type} disabled={disabled} onClick={onClick} className= {`w-full text-amber-50  rounded-lg h-10 mt-4 ${classname}`} >{label}</button>
    </div>
  )
}

export default Button

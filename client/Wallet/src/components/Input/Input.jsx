import React from 'react'

const Input = ({
    label = "",
    name = "",
    type = "",
    isRequired = true,
    placeholde = "",
    value ='',
    classname="",
     onChange = ()=>{},

}) => {
  return (
    <div className='m-[10px] w-[350px]'>
        <label id={name} className='block text-sm font-medium text-white'>{label}</label>
        <input type={type}
        id={name}
        className= {`mt-3.5 border border-gray-500 text-amber-50 text-sm  focus:ring-gray-500 focus:border-gray-200 block w-[300px] dark:focus:ring-gray-200 dark:focus:border-gray-200 h-[40px] rounded-sm ${classname}`} 
        placeholder={placeholde}
        required={isRequired}
        value={value}
        onChange={onChange}
        />
    </div>
  )
}

export default Input
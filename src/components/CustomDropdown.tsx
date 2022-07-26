import React, {
  FC,
  useRef,
  useState,
} from 'react';

export const CustomDropDown: FC<{
    className?: string,
    dropdownList: string[]
    value: string,
    onChange: Function
}> = ({ className, dropdownList, value, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const onSelected = (selected: string) => {
        onChange(selected);
        ref.current?.blur();
    };
    return (
        <div ref={ref} className={`w-full relative ${className}`} tabIndex={0} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
            <div className='border p-1 h-9'>
                <span className='text-md capitalize'>{value}</span>
               
 
            </div>
            {
                isFocused &&
                <div className='mt-2 bg-gray-100 max-h-40 overflow-y-auto z-10 w-full border'>
                    <ul className=''>
                        {
                            dropdownList.length > 0 &&
                            dropdownList.map((option) => {
                                return (
                                    <li className='w-full capitalize p-1 cursor-pointer hover:bg-gray-200'
                                        key={option}
                                        onClick={(e) => onSelected(option)}>
                                        {option}
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            }
                   </div >
    )
}
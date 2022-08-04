import {
  useRef,
  useState,
} from 'react';

interface DropDownProps<T extends string | Object, K extends string | Object> {
    className?: string | undefined;
    options: T[];
    value: T;
    getLabel: (value: T) => K;
    onChange: (value: T) => void;
}

export default function CustomDropDown<T extends string | Object, K extends string | Object>(props: DropDownProps<T, K>) {
    const { className, options, value, getLabel, onChange } = props;
    const [isFocused, setIsFocused] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const onSelected = (selected: T) => {
        onChange(selected);
        ref.current?.blur();
    };
    return (
        <div ref={ref} className={`w-full relative ${className}`} tabIndex={0} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
            <div className='border p-1 h-9'>
                <span className='text-md capitalize'>{value.toString()}</span>
            </div>
            {
                isFocused &&
                <div className='mt-2 bg-gray-100 max-h-40 overflow-y-auto z-10 w-full border'>
                    <ul className=''>
                        {
                            options.length > 0 &&
                            options.map((option, i) => {
                                return (
                                    <li className='w-full capitalize p-1 cursor-pointer hover:bg-gray-200'
                                        key={i}
                                        onClick={(e) => onSelected(option)}>
                                        {getLabel(option).toString()}
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
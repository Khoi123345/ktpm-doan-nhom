import React, { useState, useMemo } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import PropTypes from 'prop-types';

const CustomCombobox = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Select an option',
    displayValue = (item) => item?.name || '',
    disabled = false,
    className = '',
    error
}) => {
    const [query, setQuery] = useState('');

    const filteredOptions = useMemo(() => {
        if (query === '') {
            return options;
        }
        return options.filter((item) => {
            const itemValue = displayValue(item);
            return itemValue
                .toLowerCase()
                .replace(/\s+/g, '')
                .includes(query.toLowerCase().replace(/\s+/g, ''));
        });
    }, [query, options, displayValue]);

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <Combobox value={value} onChange={onChange} disabled={disabled} nullable>
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 sm:text-sm">
                        <Combobox.Input
                            className={`w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            displayValue={displayValue}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={placeholder}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <FiChevronDown
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                    </div>
                    <Transition
                        as={React.Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                            {filteredOptions.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                    Không tìm thấy kết quả.
                                </div>
                            ) : (
                                filteredOptions.map((item) => (
                                    <Combobox.Option
                                        key={item.code || item.id || displayValue(item)}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                                            }`
                                        }
                                        value={item}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                        }`}
                                                >
                                                    {displayValue(item)}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-primary-600' : 'text-primary-600'
                                                            }`}
                                                    >
                                                        <FiCheck className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    </Transition>
                </div>
            </Combobox>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

CustomCombobox.propTypes = {
    label: PropTypes.string,
    options: PropTypes.array,
    value: PropTypes.any,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    displayValue: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    error: PropTypes.string
};

export default CustomCombobox;

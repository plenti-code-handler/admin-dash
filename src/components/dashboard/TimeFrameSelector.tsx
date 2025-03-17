'use client';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface TimeFrameSelectorProps {
  selected: string;
  onSelect: (timeFrame: string) => void;
}

export default function TimeFrameSelector({ selected, onSelect }: TimeFrameSelectorProps) {
  const timeFrames = [
    { label: 'Last Month', value: '1M' },
    { label: 'Last 6 Months', value: '6M' },
    { label: 'Last Year', value: '1Y' },
  ];

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
        {timeFrames.find(t => t.value === selected)?.label}
        <ChevronDownIcon className="w-4 h-4 ml-1" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
          {timeFrames.map((timeFrame) => (
            <Menu.Item key={timeFrame.value}>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } w-full text-left px-4 py-2 text-sm text-gray-700`}
                  onClick={() => onSelect(timeFrame.value)}
                >
                  {timeFrame.label}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DebouncedSliderProps {
  id: string;
  name?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  onImmediateChange?: (value: number) => void;
  className?: string;
}

export const useDebouncedCallback = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<number>();

  const debouncedFn = useCallback((...args: Parameters<T>) => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    []
  );

  return debouncedFn;
};

const DebouncedSlider: React.FC<DebouncedSliderProps> = ({
  id,
  name,
  min,
  max,
  step,
  value,
  onChange,
  onImmediateChange,
  className,
}) => {
  const [internalValue, setInternalValue] = useState<number>(value);
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const debouncedChange = useDebouncedCallback((val: number) => {
    onChange(val);
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.valueAsNumber;
    setInternalValue(val);
    if (onImmediateChange) onImmediateChange(val);
    debouncedChange(val);
  };

  return (
    <input
      type="range"
      id={id}
      name={name}
      min={min}
      max={max}
      step={step}
      value={internalValue}
      className={className}
      onChange={handleChange}
    />
  );
};

export default DebouncedSlider;

import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
}

const AnimatedNumber = ({ value }: AnimatedNumberProps) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = display;
    const end = value;
    if (start === end) return;

    const stepTime = 100; // ms per update
    const steps = Math.ceil(Math.abs(end - start) / 5);
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplay(start + ((end - start) * currentStep) / steps);
      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, [value]);

  return <span>{Math.round(display)}</span>;
};

export default AnimatedNumber;

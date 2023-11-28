import { useEffect, useRef } from "react";

export const useAnimationFrame = (callback: (deltaTime: number) => void) => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  const animate = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);
};

// const Counter = () => {
//   const [count, setCount] = useState(0)
//
//   useAnimationFrame(deltaTime => {
//     setCount(prevCount => (prevCount + deltaTime * 0.01) % 100)
//   })
//
//   return <div>{Math.round(count)}</div>
// }

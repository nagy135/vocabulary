import { useEffect, useRef } from "react";

export const useAnimationFrame = (
  callback: (deltaTime: number) => void,
  ms: number,
) => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const passedRef = useRef<number>(0);

  const animate = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      if (passedRef.current > ms) {
        passedRef.current = 0;
        callback(deltaTime);
      }
      passedRef.current += deltaTime;
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

import { useRef, useEffect } from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';

const useP5 = (sketch) => {
  const p5Ref = useRef(null);

  useEffect(() => {
    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
      }
    };
  }, []);

  return sketch;
};

export default useP5; 
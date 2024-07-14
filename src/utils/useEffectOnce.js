import { useRef, useEffect, useState } from 'react';

const useEffectOnce = (effect, dependencies) => {
  const destroyFunc = useRef();
  const effectCalled = useRef(false);
  const renderAfterCalled = useRef(false);
  const [, setVal] = useState(0);

  if (effectCalled.current) {
    renderAfterCalled.current = true;
  }

  useEffect(() => {
    if (!effectCalled.current) {
      console.log('Effect is called');  // 添加日誌
      destroyFunc.current = effect();
      effectCalled.current = true;
    }

    setVal((val) => val + 1);

    return () => {
      if (!renderAfterCalled.current) return;
      if (destroyFunc.current) destroyFunc.current();
    };
  }, dependencies);
};

export default useEffectOnce;

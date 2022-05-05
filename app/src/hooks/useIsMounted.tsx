import { useCallback, useEffect, useRef } from 'react';

/**
 * Use to track if a component is mounted/unmounted.
 *
 * Why? If a component is running an async operation, and becomes unmounted during its execution, then any state
 * related actions that would normally run when the async operation finishes can no longer be run (as the component
 * is no longer mounted). Check the value of this function before making touching state, and skip if it returns false.
 *
 * Example:
 *
 * const isMounted = useIsMounted()
 *
 * callThatReturnsAPromise().then((value) => {
 *   if (isMounted()) {
 *     return;
 *   }
 *   updateState(value)
 * )
 *
 * @export
 * @return {*}  {() => boolean}
 */
export default function useIsMounted(): () => boolean {
  const ref = useRef(false);

  useEffect(() => {
    ref.current = true;

    return () => {
      ref.current = false;
    };
  }, []);

  return useCallback(() => ref.current, [ref]);
}

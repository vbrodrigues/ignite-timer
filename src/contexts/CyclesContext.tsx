import { differenceInSeconds } from "date-fns";
import {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  addNewCycleAction,
  finishCurrentCycleAction,
  interruptCurrentCycle,
} from "../reducers/cycles/actions";
import { Cycle, cyclesReducer } from "../reducers/cycles/reducer";

interface CreateCycleData {
  task: string;
  minutesAmount: number;
}

interface CyclesContextType {
  markCurrentCycleAsFinished: () => void;
  setSecondsPassed: (seconds: number) => void;
  createNewCycle: (data: CreateCycleData) => void;
  interruptCycle: () => void;
  cycles: Cycle[];
  activeCycle: Cycle | undefined;
  activeCycleId: string | null;
  secondsAmountPassed: number;
}

export const CyclesContext = createContext({} as CyclesContextType);

interface CyclesContextProviderProps {
  children: ReactNode;
}

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  const [cyclesState, dispatch] = useReducer(
    cyclesReducer,
    {
      cycles: [],
      activeCycleId: null,
    },
    () => {
      const storageStateAsJSON = localStorage.getItem(
        "@ignite-timer:cycles-state-1.0.0"
      );
      if (storageStateAsJSON) {
        return JSON.parse(storageStateAsJSON);
      }
      return {
        cycles: [],
        activeCycleId: null,
      };
    }
  );

  const { cycles, activeCycleId } = cyclesState;
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId);

  const [secondsAmountPassed, setSecondsAmountPassed] = useState(() => {
    if (activeCycle) {
      return differenceInSeconds(new Date(), new Date(activeCycle.startDate));
    }
    return 0;
  });

  useEffect(() => {
    const stateJSON = JSON.stringify(cyclesState);
    localStorage.setItem("@ignite-timer:cycles-state-1.0.0", stateJSON);
  }, [cyclesState]);

  function markCurrentCycleAsFinished() {
    dispatch(finishCurrentCycleAction());
  }

  function setSecondsPassed(seconds: number) {
    setSecondsAmountPassed(seconds);
  }

  function createNewCycle(data: CreateCycleData) {
    const newCycle: Cycle = {
      id: String(new Date().getTime()),
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    };

    dispatch(addNewCycleAction(newCycle));
    setSecondsAmountPassed(0);
  }

  function interruptCycle() {
    dispatch(interruptCurrentCycle());
  }

  return (
    <CyclesContext.Provider
      value={{
        markCurrentCycleAsFinished,
        setSecondsPassed,
        createNewCycle,
        interruptCycle,
        cycles,
        activeCycle,
        activeCycleId,
        secondsAmountPassed,
      }}
    >
      {children}
    </CyclesContext.Provider>
  );
}

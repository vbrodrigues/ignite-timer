import { differenceInSeconds } from "date-fns";
import { useContext, useEffect } from "react";
import { CyclesContext } from "../../../contexts/CyclesContext";
import { CountdownContainer, Separator } from "./Countdown.styles";

export function Countdown() {
  const {
    activeCycle,
    activeCycleId,
    markCurrentCycleAsFinished,
    secondsAmountPassed,
    setSecondsPassed,
  } = useContext(CyclesContext);

  const totalSeconds = activeCycle ? activeCycle.minutesAmount * 60 : 0;

  useEffect(() => {
    // eslint-disable-next-line no-undef
    let interval: NodeJS.Timer;

    if (activeCycle) {
      interval = setInterval(() => {
        const secondsDifference = differenceInSeconds(
          new Date(),
          new Date(activeCycle.startDate)
        );

        if (secondsDifference >= totalSeconds) {
          markCurrentCycleAsFinished();
          setSecondsPassed(totalSeconds);
          clearInterval(interval);
        } else {
          setSecondsPassed(secondsDifference);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [
    activeCycle,
    totalSeconds,
    activeCycleId,
    markCurrentCycleAsFinished,
    setSecondsPassed,
  ]);

  const currentSeconds = activeCycle ? totalSeconds - secondsAmountPassed : 0;
  const currentMinutesAmount = Math.floor(currentSeconds / 60);
  const currentSecondsAmount = currentSeconds % 60;
  const formattedMinutes = String(currentMinutesAmount).padStart(2, "0");
  const formattedSeconds = String(currentSecondsAmount).padStart(2, "0");

  useEffect(() => {
    if (activeCycle) {
      document.title = `${formattedMinutes}:${formattedSeconds}`;
    }
  }, [formattedMinutes, formattedSeconds, activeCycle]);

  return (
    <CountdownContainer>
      <span>{formattedMinutes[0]}</span>
      <span>{formattedMinutes[1]}</span>
      <Separator>:</Separator>
      <span>{formattedSeconds[0]}</span>
      <span>{formattedSeconds[1]}</span>
    </CountdownContainer>
  );
}

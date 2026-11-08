// A live clock with a greeting. It has its own timer, so only the clock redraws each second
// instead of the whole dashboard.
import { useEffect, useState } from "react";

function greetingFor(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer); // stop the timer when leaving the page
  }, []);

  return (
    <div className="clock">
      <p className="clock-time">
        {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </p>
      <p className="clock-date">
        {greetingFor(now.getHours())}. It's {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.
      </p>
    </div>
  );
}

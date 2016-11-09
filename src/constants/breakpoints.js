const breakpoints = {
  palm: "screen and (max-width: 44.9375em)",
  lap: "screen and (min-width: 45em) and (max-width: 63.9375em)",
  desk: "screen and (min-width: 64em)"
};

export function getDevice() {
  for (let device in breakpoints) {
    const breakpoint = breakpoints[device];
    if(window.matchMedia(breakpoint).matches) {
      return device;
    }
  }
}